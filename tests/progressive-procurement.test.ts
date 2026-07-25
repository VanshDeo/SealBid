import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROCUREMENT_CIRCUITS_METADATA } from "../contracts/managed/procurement/index.js";
import {
  createProcurementAction,
  submitStage1EligibilityAction,
  submitStage2TechnicalProposalAction,
  evaluateStage2TechnicalAction,
  submitStage3CommercialBidAction,
  evaluateStage3AwardAction,
  revealStage4WinningLegalDocAction,
} from "../actions/procurement-actions";
import { ProcurementStorage } from "../storage/procurement-storage";
import { VendorProfile } from "../lib/types";

describe("SealBid Progressive Procurement Multi-Stage Test Suite", () => {
  const testRfpId = "rfp_progressive_test_2026";
  const buyerWallet = "mn_test1qqbuyer_test_address_001";
  const vendor1Wallet = "mn_test1qqvendor_alpha_address_001";
  const vendor2Wallet = "mn_test1qqvendor_beta_address_002";

  describe("1. Managed Contract Circuit Verification for Progressive Procurement", () => {
    it("should export 5 compiled circuits covering all 4 progressive stages", () => {
      assert.equal(PROCUREMENT_CIRCUITS_METADATA.circuits.length, 5);

      const circuitNames = PROCUREMENT_CIRCUITS_METADATA.circuits.map((c) => c.name);
      assert.deepEqual(circuitNames, [
        "register_procurement",
        "verify_procurement_eligibility",
        "submit_technical_proposal_hash",
        "submit_commercial_bid_commitment",
        "reveal_winner_legal_proof",
      ]);
    });
  });

  describe("2. Progressive Procurement 4-Stage Workflow Execution", () => {
    let vendor1AnonId: string;
    let vendor2AnonId: string;

    it("Stage 1: Should verify vendor eligibility in ZK without revealing identity", async () => {
      // Vendor 1 satisfies turnover ($15M >= $10M) and experience (7 >= 5)
      const res1 = await submitStage1EligibilityAction({
        procurementId: "rfp_2026_001",
        vendorWalletAddress: vendor1Wallet,
        vendorTurnoverUsd: 15_000_000,
        vendorExperienceYears: 7,
      });

      assert.equal(res1.success, true);
      assert.ok(res1.submission);
      assert.ok(res1.anonymousBidderId?.startsWith("anon_bidder_"));
      assert.equal(res1.submission.isEligible, true);

      // Crucially: The anonymousBidderId does NOT contain the vendor's wallet address or company name
      assert.equal(res1.anonymousBidderId.includes(vendor1Wallet), false);
      vendor1AnonId = res1.anonymousBidderId;

      // Vendor 2 satisfies eligibility as well
      const res2 = await submitStage1EligibilityAction({
        procurementId: "rfp_2026_001",
        vendorWalletAddress: vendor2Wallet,
        vendorTurnoverUsd: 22_000_000,
        vendorExperienceYears: 10,
      });

      assert.equal(res2.success, true);
      assert.ok(res2.anonymousBidderId);
      vendor2AnonId = res2.anonymousBidderId;

      // Verify that two different vendors receive distinct anonymous pseudonym IDs
      assert.notEqual(vendor1AnonId, vendor2AnonId);
    });

    it("Stage 1: Should reject ineligible vendors whose turnover is below threshold", async () => {
      const resIneligible = await submitStage1EligibilityAction({
        procurementId: "rfp_2026_001",
        vendorWalletAddress: "mn_test1qqvendor_underqualified",
        vendorTurnoverUsd: 2_000_000, // Below $10M requirement
        vendorExperienceYears: 2,
      });

      assert.equal(resIneligible.success, false);
      assert.ok(resIneligible.error?.includes("thresholds"));
    });

    it("Stage 2: Should accept technical proposals for Stage 1 eligible anonymous bidders", async () => {
      const techRes1 = await submitStage2TechnicalProposalAction({
        procurementId: "rfp_2026_001",
        anonymousBidderId: vendor1AnonId,
        technicalSpecs: "5-axis CNC titanium actuators with ±0.001mm precision tolerance.",
        methodology: "Cleanroom assembly with 100% automated laser interferometry testing.",
        deliveryTimelineDays: 45,
        equipmentSummary: "3x DMG Mori mills, 2x Zeiss CMM inspection stations.",
      });

      assert.equal(techRes1.success, true);
      assert.ok(techRes1.submission);
      assert.equal(techRes1.submission.anonymousBidderId, vendor1AnonId);
      assert.equal(techRes1.submission.status, "PENDING");

      // Verify identity and commercial price remain concealed in Stage 2 submission payload
      assert.equal(techRes1.submission.proposalHash.startsWith("0xtech_"), true);

      // Submit Stage 2 for Vendor 2 as well
      await submitStage2TechnicalProposalAction({
        procurementId: "rfp_2026_001",
        anonymousBidderId: vendor2AnonId,
        technicalSpecs: "Titanium alloy aerospace actuators with ISO Class 5 cleanroom packaging.",
        methodology: "Robotic assembly line.",
        deliveryTimelineDays: 60,
        equipmentSummary: "4x Okuma 5-axis machining centers.",
      });
    });

    it("Stage 2: Should allow buyer to evaluate technical proposals (Pass / Reject)", async () => {
      const evalRes1 = await evaluateStage2TechnicalAction({
        procurementId: "rfp_2026_001",
        anonymousBidderId: vendor1AnonId,
        status: "PASSED",
        technicalScore: 95,
      });

      assert.equal(evalRes1.success, true);
      const targetSub = evalRes1.state?.stage2Technical.find((t) => t.anonymousBidderId === vendor1AnonId);
      assert.equal(targetSub?.status, "PASSED");
      assert.equal(targetSub?.technicalScore, 95);

      // Pass Vendor 2 as well
      await evaluateStage2TechnicalAction({
        procurementId: "rfp_2026_001",
        anonymousBidderId: vendor2AnonId,
        status: "PASSED",
        technicalScore: 88,
      });
    });

    it("Stage 3: Should accept sealed commercial pricing bids from technically qualified bidders", async () => {
      const commRes1 = await submitStage3CommercialBidAction({
        procurementId: "rfp_2026_001",
        anonymousBidderId: vendor1AnonId,
        bidAmountUsd: 13_500_000,
      });

      assert.equal(commRes1.success, true);
      assert.ok(commRes1.submission);
      assert.equal(commRes1.submission.anonymousBidderId, vendor1AnonId);
      assert.equal(commRes1.submission.bidAmountUsd, 13_500_000);
      assert.ok(commRes1.submission.bidCommitmentHash.startsWith("0xcomm_"));

      // Vendor 2 submits commercial bid
      await submitStage3CommercialBidAction({
        procurementId: "rfp_2026_001",
        anonymousBidderId: vendor2AnonId,
        bidAmountUsd: 14_200_000,
      });
    });

    it("Stage 3: Should allow buyer to award contract to the winning bidder", async () => {
      // Buyer selects Vendor 1 ($13.5M bid, 95 tech score) as the winning supplier
      const awardRes = await evaluateStage3AwardAction({
        procurementId: "rfp_2026_001",
        winningAnonymousBidderId: vendor1AnonId,
      });

      assert.equal(awardRes.success, true);
      assert.equal(awardRes.state?.winningAnonymousBidderId, vendor1AnonId);
      assert.equal(awardRes.state?.currentStage, "STAGE_4_LEGAL_REVEAL");

      const winningComm = awardRes.state?.stage3Commercial.find((c) => c.anonymousBidderId === vendor1AnonId);
      assert.equal(winningComm?.isWinningBid, true);
    });

    it("Stage 4: Should selectively reveal ONLY the winning supplier's legal documentation to the buyer", async () => {
      const winnerProfile: VendorProfile = {
        companyName: "Aerospace Precision Dynamics Solutions GmbH",
        registrationNumber: "HRB-987452-DE",
        taxId: "DE-304928174",
        country: "Germany",
        businessAddress: "Technologiepark 14, 80331 Munich, Germany",
        contactPerson: "Dr. Klaus Obermeier",
        email: "klaus.obermeier@aerospace-precision.de",
        website: "https://aerospace-precision.de",
        certifications: [
          {
            id: "c1",
            name: "ISO 9001: Quality Management",
            issuer: "TÜV SÜD",
            issuedDate: "2023-01-15",
            expiryDate: "2027-01-15",
            documentHash: "0xhash_iso9001",
          },
        ],
        annualTurnoverUsd: 18_500_000,
        fiscalYear: "2025",
        auditedReportHash: "0xhash_audit_2025",
        facilitiesCount: 3,
        monthlyCapacity: "500 CNC Units",
        equipmentDetails: "5x 5-axis Titanium Mills",
        yearsExperience: 10,
        previousProjects: [],
      };

      const legalRes = await revealStage4WinningLegalDocAction({
        procurementId: "rfp_2026_001",
        buyerWalletAddress: buyerWallet,
        winningVendorWalletAddress: vendor1Wallet,
        vendorProfile: winnerProfile,
      });

      assert.equal(legalRes.success, true);
      assert.ok(legalRes.legalReveal);
      assert.equal(legalRes.legalReveal.winningAnonymousBidderId, vendor1AnonId);
      assert.equal(legalRes.legalReveal.revealedLegalDoc.companyName, "Aerospace Precision Dynamics Solutions GmbH");
      assert.equal(legalRes.legalReveal.revealedLegalDoc.taxId, "DE-304928174");
      assert.ok(legalRes.legalReveal.revealedLegalDoc.bankAccountIBAN.startsWith("DE893704004405320130"));

      // Verify state transition to COMPLETED
      const finalState = ProcurementStorage.getProgressiveState("rfp_2026_001");
      assert.equal(finalState.currentStage, "COMPLETED");
    });

    it("Stage 4 Privacy Guarantee: Non-winning vendor's identity and legal docs MUST remain completely unrevealed", () => {
      const finalState = ProcurementStorage.getProgressiveState("rfp_2026_001");

      // Verify that the legal reveal record contains ONLY Vendor 1 details
      assert.equal(finalState.stage4LegalReveal?.winningAnonymousBidderId, vendor1AnonId);
      assert.equal(finalState.stage4LegalReveal?.winningVendorWalletAddress, vendor1Wallet);

      // Confirm Vendor 2's legal profile, tax ID, registration #, and wallet address are NOWHERE in the legal reveal record
      assert.equal(JSON.stringify(finalState.stage4LegalReveal).includes(vendor2Wallet), false);
      assert.equal(JSON.stringify(finalState.stage4LegalReveal).includes("mn_test1qqvendor_beta"), false);
    });
  });
});
