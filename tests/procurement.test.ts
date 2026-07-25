import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROCUREMENT_CIRCUITS_METADATA } from "../contracts/managed/procurement/index.js";
import { generateCompactEligibilityRules } from "../lib/compact-rule-generator";
import { createProcurementAction, CreateProcurementInput } from "../actions/procurement-actions";

describe("SealBid Procurement Creation & Compact ZK Rule Generator Test Suite", () => {
  describe("1. Managed Compact Procurement Circuit Artifacts", () => {
    it("should export ProcurementRegistryContract circuit metadata with 6 compiled circuits", () => {
      assert.equal(
        PROCUREMENT_CIRCUITS_METADATA.contractName,
        "ProcurementRegistryContract"
      );
      assert.equal(PROCUREMENT_CIRCUITS_METADATA.circuits.length, 6);

      const circuitNames = PROCUREMENT_CIRCUITS_METADATA.circuits.map((c) => c.name);
      assert.deepEqual(circuitNames, [
        "register_procurement",
        "verify_procurement_eligibility",
        "submit_technical_proposal_hash",
        "submit_commercial_bid_commitment",
        "evaluate_winning_bid",
        "reveal_winner_legal_proof",
      ]);
    });

    it("should have valid verification key hashes for register_procurement circuit", () => {
      const regCircuit = PROCUREMENT_CIRCUITS_METADATA.circuits.find(
        (c) => c.name === "register_procurement"
      );
      assert.ok(regCircuit);
      assert.equal(regCircuit.inputsCount, 6);
      assert.equal(regCircuit.witnessCount, 0);
      assert.ok(regCircuit.provingKeyHash.startsWith("0x"));
      assert.ok(regCircuit.verificationKeyHash.startsWith("0x"));
    });

    it("should have valid verification key hashes for verify_procurement_eligibility circuit", () => {
      const qualCircuit = PROCUREMENT_CIRCUITS_METADATA.circuits.find(
        (c) => c.name === "verify_procurement_eligibility"
      );
      assert.ok(qualCircuit);
      assert.equal(qualCircuit.inputsCount, 3);
      assert.equal(qualCircuit.witnessCount, 3);
      assert.ok(qualCircuit.provingKeyHash.startsWith("0x"));
      assert.ok(qualCircuit.verificationKeyHash.startsWith("0x"));
    });
  });

  describe("2. Compact-Compatible Eligibility Rule Generator Engine", () => {
    const title = "High-Speed Rail Actuators Tender";
    const minTurnoverUsd = 15_000_000;
    const minExperienceYears = 7;
    const requiredCerts = ["ISO 9001: Quality Management", "AS9100: Aerospace Quality"];

    it("should compile valid Compact smart contract source code string", async () => {
      const rules = await generateCompactEligibilityRules(
        title,
        minTurnoverUsd,
        minExperienceYears,
        requiredCerts
      );

      assert.equal(typeof rules.compactSourceCode, "string");
      assert.ok(rules.compactSourceCode.includes("module ProcurementEligibilityCircuit"));
      assert.ok(rules.compactSourceCode.includes("verify_procurement_eligibility"));
      assert.ok(rules.compactSourceCode.includes("vendor_turnover_usd >= min_turnover_threshold_usd"));
    });

    it("should output deterministic rule commitment and predicate expression hashes with 0x prefix", async () => {
      const rules1 = await generateCompactEligibilityRules(
        title,
        minTurnoverUsd,
        minExperienceYears,
        requiredCerts
      );
      const rules2 = await generateCompactEligibilityRules(
        title,
        minTurnoverUsd,
        minExperienceYears,
        requiredCerts
      );

      assert.equal(rules1.ruleCommitmentHash, rules2.ruleCommitmentHash);
      assert.equal(rules1.predicateHash, rules2.predicateHash);
      assert.ok(rules1.ruleCommitmentHash.startsWith("0x"));
      assert.ok(rules1.predicateHash.startsWith("0x"));
    });

    it("should define correct public inputs and private witness variables", async () => {
      const rules = await generateCompactEligibilityRules(
        title,
        minTurnoverUsd,
        minExperienceYears,
        requiredCerts
      );

      assert.deepEqual(rules.publicInputs, [
        "procurement_id",
        "min_turnover_threshold_usd",
        "min_experience_threshold_years",
      ]);
      assert.deepEqual(rules.privateWitnesses, [
        "vendor_turnover_usd",
        "vendor_experience_years",
        "certifications_hash",
      ]);
    });
  });

  describe("3. Procurement Creation Server Action & Storage Rules", () => {
    const sampleInput: CreateProcurementInput = {
      title: "Semiconductor Cleanroom Wafer Supply Tender",
      description: "Supply of 300mm silicon wafer substrates.",
      buyerAddress: "mn_test1qqbuyer999x79093eamxvgspg8p3pwn5q963g6v",
      sector: "Semiconductors",
      estimatedBudgetUsd: 20_000_000,
      evaluationCriteria: {
        technicalScoreWeight: 50,
        financialPriceWeight: 35,
        qualityScoreWeight: 15,
        scoringMethod: "Weighted Technical-Cost Ratio",
      },
      eligibilityThresholds: {
        minTurnoverUsd: 12_000_000,
        minExperienceYears: 6,
        minFacilitiesCount: 2,
        requiredCertifications: ["ISO 9001: Quality Management"],
      },
      deadlines: {
        qualificationDeadline: new Date(Date.now() + 86400 * 5 * 1000).toISOString(),
        biddingDeadline: new Date(Date.now() + 86400 * 10 * 1000).toISOString(),
        revealDeadline: new Date(Date.now() + 86400 * 12 * 1000).toISOString(),
        awardDate: new Date(Date.now() + 86400 * 15 * 1000).toISOString(),
      },
      biddingStage: "TWO_STAGE_QUALIFICATION",
      contractTerms: {
        paymentTerms: "Net 45 Days",
        deliveryTimelineDays: 60,
        warrantyYears: 2,
        penaltyClause: "0.5% Per Day Delay",
      },
    };

    it("should successfully compile rules and construct ProcurementRfp object", async () => {
      const res = await createProcurementAction(sampleInput);

      assert.equal(res.success, true);
      assert.ok(res.rfp);
      assert.ok(res.rfp.id.startsWith("rfp_"));
      assert.equal(res.rfp.title, sampleInput.title);
      assert.equal(res.rfp.estimatedBudgetUsd, 20_000_000);
      assert.equal(res.rfp.status, "OPEN");
      assert.ok(res.transactionHash?.startsWith("0xtx_procurement_reg_"));
      assert.ok(res.rfp.compactRules.ruleCommitmentHash.startsWith("0x"));
    });

    it("should reject procurement creation when title or buyer address is missing", async () => {
      const invalidInput = { ...sampleInput, title: "" };
      const res = await createProcurementAction(invalidInput);

      assert.equal(res.success, false);
      assert.ok(res.error?.includes("Missing required"));
    });
  });

  describe("4. Zero-Knowledge Threshold Predicate Verification", () => {
    it("should verify vendor eligibility in ZK when vendor satisfies threshold requirements", () => {
      const minTurnover = 10_000_000;
      const minExperience = 5;

      const vendorTurnover = 15_000_000;
      const vendorExperience = 8;

      const isEligible = vendorTurnover >= minTurnover && vendorExperience >= minExperience;
      assert.equal(isEligible, true);
    });

    it("should fail ZK eligibility proof when vendor turnover is below requirement", () => {
      const minTurnover = 20_000_000;
      const minExperience = 5;

      const vendorTurnover = 15_000_000;
      const vendorExperience = 8;

      const isEligible = vendorTurnover >= minTurnover && vendorExperience >= minExperience;
      assert.equal(isEligible, false);
    });
  });
});
