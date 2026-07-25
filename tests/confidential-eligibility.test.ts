import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROCUREMENT_CIRCUITS_METADATA } from "../contracts/managed/procurement/index.js";
import { verifyConfidentialEligibilityAction } from "../actions/procurement-actions";
import { ConfidentialEligibilityCheckInput } from "../lib/types";

describe("Confidential Eligibility Verification with Compact Smart Contracts Test Suite", () => {
  const rfpId = "rfp_confidential_test_2026";
  const vendorId = "vendor_alpha_stealth_007";

  describe("1. Compact Smart Contract Circuit Metadata Verification", () => {
    it("should export verify_procurement_eligibility circuit metadata for Midnight Network", () => {
      const circuit = PROCUREMENT_CIRCUITS_METADATA.circuits.find(
        (c) => c.name === "verify_procurement_eligibility"
      );

      assert.ok(circuit);
      assert.equal(circuit.inputsCount, 3);
      assert.equal(circuit.witnessCount, 3);
      assert.ok(circuit.provingKeyHash.startsWith("0x"));
      assert.ok(circuit.verificationKeyHash.startsWith("0x"));
    });
  });

  describe("2. Confidential ZK Proof Execution & Pass/Fail Buyer Package", () => {
    it("should return Pass (VERIFIED) proof package when vendor satisfies thresholds", async () => {
      const input: ConfidentialEligibilityCheckInput = {
        procurementId: rfpId,
        vendorId,
        requiredTurnoverUsd: 10_000_000,
        requiredExperienceYears: 5,
        privateWitness: {
          actualTurnoverUsd: 15_000_000, // Satisfies $10M requirement
          actualExperienceYears: 8, // Satisfies 5 yrs requirement
          auditedReportHash: "0xaudited_report_tuv_2025_hash_999",
          certificationsHash: "0xhash_iso9001_as9100",
        },
      };

      const res = await verifyConfidentialEligibilityAction(input);

      assert.equal(res.success, true);
      assert.ok(res.proofPackage);
      assert.equal(res.proofPackage.isQualified, true);
      assert.equal(res.proofPackage.proofStatus, "VERIFIED");
      assert.equal(res.proofPackage.circuitName, "verify_procurement_eligibility");
      assert.ok(res.proofPackage.proofHash.startsWith("0xzk_proof_compact_"));
      assert.ok(res.proofPackage.verificationKeyHash.startsWith("0x"));

      // Criteria Breakdown
      assert.equal(res.proofPackage.criteriaBreakdown.turnoverSatisfied, true);
      assert.equal(res.proofPackage.criteriaBreakdown.experienceSatisfied, true);
      assert.equal(res.proofPackage.criteriaBreakdown.certificationsSatisfied, true);
    });

    it("should return Fail (FAILED) proof package when vendor fails turnover requirement", async () => {
      const input: ConfidentialEligibilityCheckInput = {
        procurementId: rfpId,
        vendorId,
        requiredTurnoverUsd: 20_000_000,
        requiredExperienceYears: 5,
        privateWitness: {
          actualTurnoverUsd: 12_000_000, // Fails $20M requirement
          actualExperienceYears: 8,
          auditedReportHash: "0xaudited_report_hash_123",
        },
      };

      const res = await verifyConfidentialEligibilityAction(input);

      assert.equal(res.success, true);
      assert.ok(res.proofPackage);
      assert.equal(res.proofPackage.isQualified, false);
      assert.equal(res.proofPackage.proofStatus, "FAILED");
      assert.equal(res.proofPackage.criteriaBreakdown.turnoverSatisfied, false);
      assert.equal(res.proofPackage.criteriaBreakdown.experienceSatisfied, true);
    });

    it("should GUARANTEE ZERO document leakage to the buyer proof package payload", async () => {
      const input: ConfidentialEligibilityCheckInput = {
        procurementId: rfpId,
        vendorId,
        requiredTurnoverUsd: 5_000_000,
        requiredExperienceYears: 3,
        privateWitness: {
          actualTurnoverUsd: 99_888_777,
          actualExperienceYears: 15,
          auditedReportHash: "SECRET_CONFIDENTIAL_PDF_HASH_9999",
        },
      };

      const res = await verifyConfidentialEligibilityAction(input);

      assert.equal(res.success, true);
      assert.ok(res.proofPackage);

      const buyerPackageJson = JSON.stringify(res.proofPackage);

      // Verify that raw actual turnover ($99,888,777) is NOT present anywhere in the buyer payload
      assert.equal(buyerPackageJson.includes("99888777"), false);
      // Verify that secret audited report document string is NOT present anywhere in the buyer payload
      assert.equal(buyerPackageJson.includes("SECRET_CONFIDENTIAL_PDF_HASH"), false);
    });
  });
});
