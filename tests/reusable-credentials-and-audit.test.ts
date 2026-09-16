import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateUnifiedProcurementCommitment } from "../lib/compact-rule-generator";
import {
  createProcurementAction,
  lockProcurementRulesAction,
  submitStage1EligibilityAction,
  submitStage2TechnicalProposalAction,
  evaluateStage2TechnicalAction,
  submitStage3CommercialBidAction,
  evaluateStage3AwardAction,
  revealStage4WinningLegalDocAction,
  getComprehensiveProcurementAuditAction,
  verifyFullTenderAuditAction,
} from "../actions/procurement-actions";
import { EncryptedVendorStorage } from "../storage/vendor-storage";
import { VendorProfile } from "../lib/types";

describe("SealBid Level-4 Enhancements: Pre-Committed Rules, Reusable Credentials & 6-Point Audit Test Suite", () => {
  const buyerWallet = "mn_test1qqbuyer_level4_audit_001";
  const vendorAlphaWallet = "mn_test1qqvendor_alpha_level4_001";
  const vendorBetaWallet = "mn_test1qqvendor_beta_level4_002";

  const vendorAlphaProfile: VendorProfile = {
    companyName: "Alpha Aerospace Dynamics GmbH",
    registrationNumber: "HRB-887766",
    taxId: "DE998877665",
    country: "Germany",
    businessAddress: "Aerospace Alley 10, Munich",
    contactPerson: "Dr. Klaus Weber",
    email: "klaus@alpha-aero.de",
    website: "https://alpha-aero.de",
    certifications: [
      {
        id: "cert_iso_9001",
        name: "ISO 9001: Quality Management",
        issuer: "TUV Sud",
        issuedDate: "2023-01-15",
        expiryDate: "2027-01-14",
        documentHash: "0xhash_iso9001_alpha",
      },
      {
        id: "cert_as_9100",
        name: "AS9100: Aerospace Quality",
        issuer: "Bureau Veritas",
        issuedDate: "2022-06-01",
        expiryDate: "2026-05-31",
        documentHash: "0xhash_as9100_alpha",
      },
    ],
    annualTurnoverUsd: 18_500_000,
    fiscalYear: "2025",
    auditedReportHash: "0xaudited_pwc_2025_hash",
    facilitiesCount: 3,
    monthlyCapacity: "500 Titanium Turbine Assemblies",
    equipmentDetails: "5x DMG Mori 5-Axis CNC Precision Mills",
    yearsExperience: 8,
    previousProjects: [
      {
        id: "proj_01",
        title: "Ariane 6 Hydraulic Actuator Manifolds",
        clientIndustry: "Space Propulsion",
        contractValueUsd: 4_200_000,
        completionYear: 2024,
        referenceHash: "0xproj_ref_ariane6",
      },
    ],
  };

  const vendorBetaProfile: VendorProfile = {
    companyName: "Beta Precision Tech SAS",
    registrationNumber: "RCS-334455",
    taxId: "FR112233445",
    country: "France",
    businessAddress: "14 Rue de l'Industrie, Toulouse",
    contactPerson: "Claire Dubois",
    email: "claire@beta-tech.fr",
    website: "https://beta-tech.fr",
    certifications: [
      {
        id: "cert_iso_9001",
        name: "ISO 9001: Quality Management",
        issuer: "Afnor",
        issuedDate: "2023-03-10",
        expiryDate: "2027-03-09",
        documentHash: "0xhash_iso9001_beta",
      },
    ],
    annualTurnoverUsd: 12_000_000,
    fiscalYear: "2025",
    auditedReportHash: "0xaudited_ey_2025_hash",
    facilitiesCount: 2,
    monthlyCapacity: "300 Actuators",
    equipmentDetails: "3x 5-Axis CNC",
    yearsExperience: 6,
    previousProjects: [],
  };

  describe("1. Pre-Committed Procurement Rules Architecture", () => {
    it("should compute deterministic unified procurement rules commitment hash", async () => {
      const title = "Confidential Level-4 Defense Procurement";
      const minTurnover = 10_000_000;
      const minExp = 5;
      const certs = ["ISO 9001: Quality Management", "AS9100: Aerospace Quality"];

      const commitmentHash = await generateUnifiedProcurementCommitment(
        title,
        minTurnover,
        minExp,
        certs,
        {
          evaluationCriteria: {
            technicalScoreWeight: 40,
            financialPriceWeight: 40,
            qualityScoreWeight: 20,
            scoringMethod: "Weighted Quality-Cost Ratio (MEAT)",
          },
          deadlines: {
            qualificationDeadline: new Date(Date.now() + 86400000).toISOString(),
            biddingDeadline: new Date(Date.now() + 172800000).toISOString(),
            revealDeadline: new Date(Date.now() + 259200000).toISOString(),
            awardDate: new Date(Date.now() + 345600000).toISOString(),
          },
        }
      );

      assert.ok(commitmentHash.startsWith("0x"));
      assert.equal(commitmentHash.length, 66); // 0x + 64 hex characters

      // Rules must differ when criteria weights or thresholds change
      const modifiedCommitmentHash = await generateUnifiedProcurementCommitment(
        title,
        12_000_000, // modified turnover
        minExp,
        certs
      );
      assert.notEqual(commitmentHash, modifiedCommitmentHash);
    });

    it("should create procurement with locked pre-committed rules hash", async () => {
      const createRes = await createProcurementAction({
        title: "Titanium Missile Actuators Level-4 Tender",
        description: "Confidential defense procurement with pre-committed rules",
        buyerAddress: buyerWallet,
        sector: "Defense & Aerospace",
        estimatedBudgetUsd: 14_000_000,
        evaluationCriteria: {
          technicalScoreWeight: 50,
          financialPriceWeight: 50,
          qualityScoreWeight: 0,
          scoringMethod: "Weighted Quality-Cost Ratio (MEAT)",
        },
        eligibilityThresholds: {
          minTurnoverUsd: 10_000_000,
          minExperienceYears: 5,
          minFacilitiesCount: 1,
          requiredCertifications: ["ISO 9001: Quality Management"],
        },
        deadlines: {
          qualificationDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
          biddingDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
          revealDeadline: new Date(Date.now() + 86400000 * 9).toISOString(),
          awardDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        },
        biddingStage: "PROGRESSIVE_CONFIDENTIAL",
        contractTerms: {
          paymentTerms: "Net 30 Days",
          deliveryTimelineDays: 60,
          warrantyYears: 3,
          penaltyClause: "1% per week delay",
        },
      });

      assert.equal(createRes.success, true);
      assert.ok(createRes.rfp);
      assert.equal(createRes.rfp.isRulesLocked, true);
      assert.ok(createRes.rfp.rulesCommitmentHash?.startsWith("0x"));

      // Test explicit lock action
      const lockRes = await lockProcurementRulesAction(createRes.rfp.id);
      assert.equal(lockRes.success, true);
      assert.ok(lockRes.rulesCommitmentHash);
    });
  });

  describe("2. Reusable Business Credentials ('RAW DATA != PROOF OF FACT')", () => {
    let alphaPassport: import("../lib/types").ReusableBusinessCredentialPassport;

    it("should generate reusable credential passport without exposing raw balance sheets", async () => {
      const storage = new EncryptedVendorStorage();
      alphaPassport = await storage.generateReusableCredentialPassport(
        vendorAlphaProfile,
        "vendor_alpha_id",
        vendorAlphaWallet
      );

      assert.ok(alphaPassport.id.startsWith("pass_"));
      assert.ok(alphaPassport.credentialCommitmentHash.startsWith("0x"));
      // Certified tier should be $15M for an $18.5M turnover
      assert.equal(alphaPassport.certifiedTurnoverTierUsd, 15_000_000);
      assert.equal(alphaPassport.certifiedExperienceYears, 8);
      assert.equal(alphaPassport.certifiedAccreditations.length, 2);
      assert.ok(alphaPassport.attestationSignature.startsWith("0xsig_cred_"));
    });

    it("should generate zero-knowledge Proof of Fact satisfying RFP thresholds", async () => {
      const storage = new EncryptedVendorStorage();
      const factProof = await storage.generateCredentialFactProof(
        alphaPassport,
        10_000_000, // required $10M
        5,          // required 5 years
        ["ISO 9001: Quality Management"]
      );

      assert.equal(factProof.turnoverSatisfied, true);
      assert.equal(factProof.experienceSatisfied, true);
      assert.equal(factProof.complianceSatisfied, true);
      assert.ok(factProof.proofOfFactHash.startsWith("0xzk_fact_"));
    });

    it("should reject Proof of Fact if credential tier is below requirement", async () => {
      const storage = new EncryptedVendorStorage();
      const factProof = await storage.generateCredentialFactProof(
        alphaPassport,
        25_000_000, // requires $25M (passport tier is $15M)
        5
      );

      assert.equal(factProof.turnoverSatisfied, false);
    });

    it("should allow Stage 1 eligibility submission using reusable credential passport", async () => {
      // Create a test RFP
      const createRes = await createProcurementAction({
        title: "Hypersonic Nozzle Machining",
        description: "High-temperature precision manufacturing",
        buyerAddress: buyerWallet,
        sector: "Defense",
        estimatedBudgetUsd: 12_000_000,
        evaluationCriteria: {
          technicalScoreWeight: 50,
          financialPriceWeight: 50,
          qualityScoreWeight: 0,
          scoringMethod: "Weighted Quality-Cost Ratio (MEAT)",
        },
        eligibilityThresholds: {
          minTurnoverUsd: 10_000_000,
          minExperienceYears: 5,
          minFacilitiesCount: 1,
          requiredCertifications: ["ISO 9001: Quality Management"],
        },
        deadlines: {
          qualificationDeadline: new Date(Date.now() + 86400000).toISOString(),
          biddingDeadline: new Date(Date.now() + 86400000 * 5).toISOString(),
          revealDeadline: new Date(Date.now() + 86400000 * 6).toISOString(),
          awardDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
        biddingStage: "PROGRESSIVE_CONFIDENTIAL",
        contractTerms: {
          paymentTerms: "Net 30",
          deliveryTimelineDays: 45,
          warrantyYears: 2,
          penaltyClause: "None",
        },
      });

      assert.ok(createRes.rfp);

      const stg1Res = await submitStage1EligibilityAction({
        procurementId: createRes.rfp.id,
        vendorWalletAddress: vendorAlphaWallet,
        credentialPassport: alphaPassport,
      });

      assert.equal(stg1Res.success, true);
      assert.ok(stg1Res.anonymousBidderId?.startsWith("anon_bidder_"));
      assert.ok(stg1Res.factProof);
      assert.equal(stg1Res.factProof.turnoverSatisfied, true);
      assert.equal(stg1Res.factProof.experienceSatisfied, true);
      assert.ok(stg1Res.submission?.proofHash.startsWith("0xzk_proof_stg1_"));
    });
  });

  describe("3. Stronger Progressive Disclosure & Transition Guards", () => {
    let procurementId: string;
    let alphaAnonId: string;
    let betaAnonId: string;

    it("should setup 4-stage progressive procurement with strict transition enforcement", async () => {
      const createRes = await createProcurementAction({
        title: "Cryogenic Valves Procurement",
        description: "Confidential cryogenic valves for space launch vehicles",
        buyerAddress: buyerWallet,
        sector: "Aerospace",
        estimatedBudgetUsd: 9_000_000,
        evaluationCriteria: {
          technicalScoreWeight: 60,
          financialPriceWeight: 40,
          qualityScoreWeight: 0,
          scoringMethod: "Weighted Quality-Cost Ratio (MEAT)",
        },
        eligibilityThresholds: {
          minTurnoverUsd: 10_000_000,
          minExperienceYears: 5,
          minFacilitiesCount: 1,
          requiredCertifications: ["ISO 9001: Quality Management"],
        },
        deadlines: {
          qualificationDeadline: new Date(Date.now() + 86400000).toISOString(),
          biddingDeadline: new Date(Date.now() + 86400000 * 5).toISOString(),
          revealDeadline: new Date(Date.now() + 86400000 * 6).toISOString(),
          awardDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
        biddingStage: "PROGRESSIVE_CONFIDENTIAL",
        contractTerms: {
          paymentTerms: "Net 60",
          deliveryTimelineDays: 90,
          warrantyYears: 3,
          penaltyClause: "0.5% daily",
        },
      });

      assert.ok(createRes.rfp);
      procurementId = createRes.rfp.id;

      // Stage 1: Both vendors qualify anonymously
      const alphaStg1 = await submitStage1EligibilityAction({
        procurementId,
        vendorWalletAddress: vendorAlphaWallet,
        vendorTurnoverUsd: 18_500_000,
        vendorExperienceYears: 8,
      });
      assert.equal(alphaStg1.success, true);
      alphaAnonId = alphaStg1.anonymousBidderId!;

      const betaStg1 = await submitStage1EligibilityAction({
        procurementId,
        vendorWalletAddress: vendorBetaWallet,
        vendorTurnoverUsd: 12_000_000,
        vendorExperienceYears: 6,
      });
      assert.equal(betaStg1.success, true);
      betaAnonId = betaStg1.anonymousBidderId!;

      // Stage 2: Submit technical proposals
      await submitStage2TechnicalProposalAction({
        procurementId,
        anonymousBidderId: alphaAnonId,
        technicalSpecs: "Cryo-valves 316L Stainless Steel 500 bar",
        methodology: "Additive manufacturing + vacuum brazing",
        deliveryTimelineDays: 75,
        equipmentSummary: "3D Metal Printers + Cleanroom Class 5",
      });

      await submitStage2TechnicalProposalAction({
        procurementId,
        anonymousBidderId: betaAnonId,
        technicalSpecs: "Cryo-valves Inconel 718",
        methodology: "Forging + precision CNC",
        deliveryTimelineDays: 85,
        equipmentSummary: "5-Axis CNC + Pressure test rig",
      });

      // Buyer evaluates technical proposals (Alpha: 95/100, Beta: 85/100)
      await evaluateStage2TechnicalAction({
        procurementId,
        anonymousBidderId: alphaAnonId,
        status: "PASSED",
        technicalScore: 95,
      });

      await evaluateStage2TechnicalAction({
        procurementId,
        anonymousBidderId: betaAnonId,
        status: "PASSED",
        technicalScore: 85,
      });

      // Stage 3: Submit sealed commercial bids
      await submitStage3CommercialBidAction({
        procurementId,
        anonymousBidderId: alphaAnonId,
        bidAmountUsd: 7_800_000,
      });

      await submitStage3CommercialBidAction({
        procurementId,
        anonymousBidderId: betaAnonId,
        bidAmountUsd: 8_200_000,
      });

      // Award winner: Alpha wins (higher tech score and lower price)
      const awardRes = await evaluateStage3AwardAction({
        procurementId,
      });

      assert.equal(awardRes.success, true);
      assert.equal(awardRes.auditTrail?.winningAnonymousBidderId, alphaAnonId);
      assert.equal(awardRes.auditTrail?.losingBidsPrivacyProtected, true);
    });

    it("should strictly REJECT Stage 4 legal reveal for losing vendor", async () => {
      // Attempt to reveal losing vendor (Beta) - MUST BE REJECTED
      const invalidRevealRes = await revealStage4WinningLegalDocAction({
        procurementId,
        buyerWalletAddress: buyerWallet,
        winningVendorWalletAddress: vendorBetaWallet, // Beta is losing vendor!
        vendorProfile: vendorBetaProfile,
      });

      assert.equal(invalidRevealRes.success, false);
      assert.ok(
        invalidRevealRes.error?.includes("Unauthorized Disclosure Violation") ||
        invalidRevealRes.error?.includes("does not belong to the designated Stage 3 winning bidder")
      );
    });

    it("should allow Stage 4 legal reveal ONLY for the winning supplier", async () => {
      // Reveal winning vendor (Alpha) - MUST SUCCEED
      const validRevealRes = await revealStage4WinningLegalDocAction({
        procurementId,
        buyerWalletAddress: buyerWallet,
        winningVendorWalletAddress: vendorAlphaWallet,
        vendorProfile: vendorAlphaProfile,
      });

      assert.equal(validRevealRes.success, true);
      assert.ok(validRevealRes.legalReveal);
      assert.equal(validRevealRes.legalReveal.winningAnonymousBidderId, alphaAnonId);
      assert.equal(validRevealRes.legalReveal.revealedLegalDoc.companyName, "Alpha Aerospace Dynamics GmbH");
    });
  });

  describe("4. Comprehensive 6-Point Auditor Verification Suite", () => {
    it("should verify all 6 pillars of procurement integrity without losing bid leakage", async () => {
      // Setup and run a full tender
      const rfpRes = await createProcurementAction({
        title: "Stealth Coating Synthesis Level-4 Tender",
        description: "Nanotech radar absorbent coating tender",
        buyerAddress: buyerWallet,
        sector: "Defense Nanotech",
        estimatedBudgetUsd: 6_000_000,
        evaluationCriteria: {
          technicalScoreWeight: 50,
          financialPriceWeight: 50,
          qualityScoreWeight: 0,
          scoringMethod: "Weighted Quality-Cost Ratio (MEAT)",
        },
        eligibilityThresholds: {
          minTurnoverUsd: 5_000_000,
          minExperienceYears: 3,
          minFacilitiesCount: 1,
          requiredCertifications: ["ISO 9001: Quality Management"],
        },
        deadlines: {
          qualificationDeadline: new Date(Date.now() + 86400000).toISOString(),
          biddingDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
          revealDeadline: new Date(Date.now() + 86400000 * 4).toISOString(),
          awardDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        },
        biddingStage: "PROGRESSIVE_CONFIDENTIAL",
        contractTerms: {
          paymentTerms: "Net 30",
          deliveryTimelineDays: 30,
          warrantyYears: 2,
          penaltyClause: "Standard",
        },
      });

      const tenderId = rfpRes.rfp!.id;

      // Stage 1
      const stg1 = await submitStage1EligibilityAction({
        procurementId: tenderId,
        vendorWalletAddress: vendorAlphaWallet,
        vendorTurnoverUsd: 18_500_000,
        vendorExperienceYears: 8,
      });
      const alphaAnon = stg1.anonymousBidderId!;

      // Stage 2
      await submitStage2TechnicalProposalAction({
        procurementId: tenderId,
        anonymousBidderId: alphaAnon,
        technicalSpecs: "Carbon nanotube multi-spectral coating",
        methodology: "Spray pyrolysis deposition",
        deliveryTimelineDays: 25,
        equipmentSummary: "Cleanroom + Anechoic chamber",
      });

      await evaluateStage2TechnicalAction({
        procurementId: tenderId,
        anonymousBidderId: alphaAnon,
        status: "PASSED",
        technicalScore: 92,
      });

      // Stage 3
      await submitStage3CommercialBidAction({
        procurementId: tenderId,
        anonymousBidderId: alphaAnon,
        bidAmountUsd: 5_200_000,
      });

      await evaluateStage3AwardAction({
        procurementId: tenderId,
      });

      // Stage 4
      await revealStage4WinningLegalDocAction({
        procurementId: tenderId,
        buyerWalletAddress: buyerWallet,
        winningVendorWalletAddress: vendorAlphaWallet,
        vendorProfile: vendorAlphaProfile,
      });

      // Now query the comprehensive 6-point audit record
      const auditRes = await getComprehensiveProcurementAuditAction(tenderId);
      assert.equal(auditRes.success, true);
      assert.ok(auditRes.auditRecord);

      const record = auditRes.auditRecord;

      // Pillar 1: Rules Pre-Commitment
      assert.equal(record.rulePreCommitmentVerification.passed, true);
      assert.ok(record.rulePreCommitmentVerification.rulesCommitmentHash.startsWith("0x"));

      // Pillar 2: ZK Eligibility
      assert.equal(record.eligibilityVerification.passed, true);
      assert.equal(record.eligibilityVerification.zeroKnowledgePreserved, true);

      // Pillar 3: Bid Validity & Uniqueness
      assert.equal(record.bidValidityVerification.passed, true);
      assert.equal(record.bidValidityVerification.allCommitmentsUnique, true);

      // Pillar 4: Deadline Enforcement
      assert.equal(record.deadlinesEnforcementVerification.passed, true);

      // Pillar 5: Winner Selection Compliance
      assert.equal(record.winnerSelectionVerification.passed, true);
      assert.equal(record.winnerSelectionVerification.losingBidsConfidentialityProtected, true);

      // Pillar 6: Selective Disclosure Authorization
      assert.equal(record.selectiveDisclosureVerification.passed, true);
      assert.equal(record.selectiveDisclosureVerification.zeroLosingDocumentsRevealed, true);

      // Full verification action execution
      const fullVerifyRes = await verifyFullTenderAuditAction(tenderId);
      assert.equal(fullVerifyRes.success, true);
      assert.ok(fullVerifyRes.message.includes("100% cryptographic verification"));
    });
  });
});
