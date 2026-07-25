import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createProcurementAction,
  submitStage1EligibilityAction,
  submitStage2TechnicalProposalAction,
  evaluateStage2TechnicalAction,
  submitStage3CommercialBidAction,
} from "../actions/procurement-actions";
import { ProcurementStorage } from "../storage/procurement-storage";
import { ProcurementContractService } from "../midnight/services/procurement-contract-service";

describe("Confidential Bidding Module & Smart Contract Validations", () => {
  const buyerWallet = "mn_test1qqbuyer_confidential_001";
  const vendor1Wallet = "mn_test1qqvendor_alpha_bidder";
  const vendor2Wallet = "mn_test1qqvendor_beta_bidder";

  let rfpId: string;
  let vendor1AnonId: string;
  let vendor2AnonId: string;

  it("0. Setup: Create confidential procurement RFP with valid deadlines and thresholds", async () => {
    const futureDeadline = new Date(Date.now() + 86400 * 7 * 1000).toISOString();

    const createRes = await createProcurementAction({
      title: "Confidential Defense Quantum Cryptography Hardware",
      description: "Encrypted procurement tender for quantum key distribution hardware units.",
      buyerAddress: buyerWallet,
      sector: "Cybersecurity & Defense",
      estimatedBudgetUsd: 25_000_000,
      evaluationCriteria: {
        technicalScoreWeight: 50,
        financialPriceWeight: 35,
        qualityScoreWeight: 15,
        scoringMethod: "MEAT",
      },
      eligibilityThresholds: {
        minTurnoverUsd: 10_000_000,
        minExperienceYears: 5,
        minFacilitiesCount: 2,
        requiredCertifications: ["ISO 27001", "FIPS 140-3"],
      },
      deadlines: {
        qualificationDeadline: futureDeadline,
        biddingDeadline: futureDeadline,
        revealDeadline: futureDeadline,
        awardDate: futureDeadline,
      },
      biddingStage: "PROGRESSIVE_CONFIDENTIAL",
      contractTerms: {
        paymentTerms: "Net 30",
        deliveryTimelineDays: 60,
        warrantyYears: 3,
        penaltyClause: "0.5% per day",
      },
    });

    assert.equal(createRes.success, true);
    assert.ok(createRes.rfp);
    rfpId = createRes.rfp.id;
  });

  it("1. Setup Prerequisites: Complete Stage 1 & Stage 2 qualification for test bidders", async () => {
    // Stage 1 for Vendor 1
    const stg1Res1 = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendor1Wallet,
      vendorTurnoverUsd: 15_000_000,
      vendorExperienceYears: 6,
    });
    assert.equal(stg1Res1.success, true);
    assert.ok(stg1Res1.anonymousBidderId);
    vendor1AnonId = stg1Res1.anonymousBidderId;

    // Stage 1 for Vendor 2
    const stg1Res2 = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendor2Wallet,
      vendorTurnoverUsd: 20_000_000,
      vendorExperienceYears: 8,
    });
    assert.equal(stg1Res2.success, true);
    assert.ok(stg1Res2.anonymousBidderId);
    vendor2AnonId = stg1Res2.anonymousBidderId;

    // Stage 2 Technical Proposal Submissions
    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: vendor1AnonId,
      technicalSpecs: "FIPS 140-3 Level 4 Quantum Key Distribution Modules.",
      methodology: "Tamper-evident optical fiber channels.",
      deliveryTimelineDays: 45,
      equipmentSummary: "Cleanroom photonic assembly station.",
    });

    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: vendor2AnonId,
      technicalSpecs: "Entanglement-based QKD satellite ground nodes.",
      methodology: "Cryogenic laser alignment.",
      deliveryTimelineDays: 60,
      equipmentSummary: "High-vacuum optical bench.",
    });

    // Buyer evaluates Stage 2: Pass Vendor 1, but do NOT pass Vendor 2 yet
    await evaluateStage2TechnicalAction({
      procurementId: rfpId,
      anonymousBidderId: vendor1AnonId,
      status: "PASSED",
      technicalScore: 94,
    });
  });

  it("2. Eligibility Validation: Smart contract MUST reject commercial bids from unqualified bidders", async () => {
    // Vendor 2 has NOT passed Stage 2 technical evaluation yet
    const rejectRes = await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: vendor2AnonId,
      bidAmountUsd: 22_000_000,
    });

    assert.equal(rejectRes.success, false);
    assert.ok(rejectRes.error?.includes("Stage 2 technical evaluation"));
  });

  it("3. Encrypted Commercial Bid Submission: Accept valid commercial bid with ZK commitment", async () => {
    const validBidRes = await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: vendor1AnonId,
      bidAmountUsd: 21_500_000,
    });

    assert.equal(validBidRes.success, true);
    assert.ok(validBidRes.submission);
    assert.equal(validBidRes.submission.anonymousBidderId, vendor1AnonId);
    assert.equal(validBidRes.submission.bidAmountUsd, 21_500_000);
    assert.ok(validBidRes.submission.bidCommitmentHash.startsWith("0xcomm_"));
    assert.ok(validBidRes.submission.encryptedBidPayload);
  });

  it("4. Uniqueness & Immutability Validation: Smart contract MUST reject duplicate bids & prevent buyer/vendor modification", async () => {
    // Attempting to submit a second commercial bid for Vendor 1
    const duplicateRes = await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: vendor1AnonId,
      bidAmountUsd: 19_000_000, // Reduced price attempt
    });

    assert.equal(duplicateRes.success, false);
    assert.ok(duplicateRes.error?.includes("already submitted a commercial bid"));

    // Verify storage immutability check directly
    assert.throws(() => {
      ProcurementStorage.addStage3Submission(rfpId, {
        bidId: "tampered_bid_001",
        anonymousBidderId: vendor1AnonId,
        bidCommitmentHash: "0xtampered_hash",
        encryptedBidPayload: "tampered_payload",
        bidAmountUsd: 10_000_000,
        submittedAt: new Date().toISOString(),
      });
    }, /immutable after submission/);
  });

  it("5. Deadline Validation: Smart contract MUST reject commercial bids submitted post-deadline", async () => {
    // Create an expired RFP
    const pastDeadline = new Date(Date.now() - 86400 * 1000).toISOString();

    const expiredRfpRes = await createProcurementAction({
      title: "Expired Tender Procurement",
      description: "Tender with past deadline for testing deadline validation.",
      buyerAddress: buyerWallet,
      sector: "Testing",
      estimatedBudgetUsd: 5_000_000,
      evaluationCriteria: {
        technicalScoreWeight: 50,
        financialPriceWeight: 50,
        qualityScoreWeight: 0,
        scoringMethod: "Lowest Price",
      },
      eligibilityThresholds: {
        minTurnoverUsd: 1_000_000,
        minExperienceYears: 1,
        minFacilitiesCount: 1,
        requiredCertifications: [],
      },
      deadlines: {
        qualificationDeadline: pastDeadline,
        biddingDeadline: pastDeadline,
        revealDeadline: pastDeadline,
        awardDate: pastDeadline,
      },
      biddingStage: "PROGRESSIVE_CONFIDENTIAL",
      contractTerms: {
        paymentTerms: "Net 30",
        deliveryTimelineDays: 30,
        warrantyYears: 1,
        penaltyClause: "None",
      },
    });

    assert.equal(expiredRfpRes.success, true);
    const expiredRfpId = expiredRfpRes.rfp!.id;

    // Stage 1 & Stage 2 setup for expired RFP
    const stg1Expired = await submitStage1EligibilityAction({
      procurementId: expiredRfpId,
      vendorWalletAddress: vendor1Wallet,
      vendorTurnoverUsd: 5_000_000,
      vendorExperienceYears: 3,
    });
    const expiredAnonId = stg1Expired.anonymousBidderId!;

    await submitStage2TechnicalProposalAction({
      procurementId: expiredRfpId,
      anonymousBidderId: expiredAnonId,
      technicalSpecs: "Test specs",
      methodology: "Test methodology",
      deliveryTimelineDays: 30,
      equipmentSummary: "Test equipment",
    });

    await evaluateStage2TechnicalAction({
      procurementId: expiredRfpId,
      anonymousBidderId: expiredAnonId,
      status: "PASSED",
      technicalScore: 90,
    });

    // Attempting Stage 3 commercial submission for expired RFP
    const expiredBidRes = await submitStage3CommercialBidAction({
      procurementId: expiredRfpId,
      anonymousBidderId: expiredAnonId,
      bidAmountUsd: 4_500_000,
    });

    assert.equal(expiredBidRes.success, false);
    assert.ok(expiredBidRes.error?.includes("Bidding deadline has passed"));
  });

  it("6. Midnight ProcurementContractService: Validate circuit execution rules", async () => {
    const mockProviders = {
      wallet: {} as any,
      proof: {} as any,
      publicData: {} as any,
      privateState: {} as any,
      privateStateProvider: {} as any,
      publicDataProvider: {} as any,
      zkConfigProvider: {} as any,
      proofProvider: {} as any,
      walletProvider: {} as any,
    };

    const service = new ProcurementContractService(mockProviders);

    // Test ProcurementContractService.submitCommercialBidCommitment deadline rejection
    await assert.rejects(
      async () => {
        await service.submitCommercialBidCommitment(
          "rfp_test_001",
          "anon_bidder_123",
          10_000_000n,
          "salt_123",
          Date.now() - 1000, // Past deadline
          [],
          true
        );
      },
      /Bidding deadline has passed/
    );

    // Test ProcurementContractService.submitCommercialBidCommitment uniqueness rejection
    await assert.rejects(
      async () => {
        await service.submitCommercialBidCommitment(
          "rfp_test_001",
          "anon_bidder_123",
          10_000_000n,
          "salt_123",
          Date.now() + 100000,
          ["anon_bidder_123"], // Existing bidder
          true
        );
      },
      /already submitted a commercial bid/
    );

    // Test ProcurementContractService.submitCommercialBidCommitment eligibility rejection
    await assert.rejects(
      async () => {
        await service.submitCommercialBidCommitment(
          "rfp_test_001",
          "anon_bidder_123",
          10_000_000n,
          "salt_123",
          Date.now() + 100000,
          [],
          false // Not technically qualified
        );
      },
      /not technically qualified/
    );
  });
});
