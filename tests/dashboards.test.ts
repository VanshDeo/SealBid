import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createProcurementAction,
  submitStage1EligibilityAction,
  submitStage2TechnicalProposalAction,
  evaluateStage2TechnicalAction,
  submitStage3CommercialBidAction,
  evaluateStage3AwardAction,
  getBuyerProcurementStatsAction,
  getVendorConfidentialSubmissionsAction,
  getAuditorIntegrityReportsAction,
  verifyAuditorProofAction,
} from "../actions/procurement-actions";

describe("Role-Based Dashboards & Selective Disclosure Audit Test Suite", () => {
  const buyerWallet = "mn_test1qqbuyer_dashboard_001";
  const vendorAlphaWallet = "mn_test1qqvendor_alpha_dashboard";
  const vendorBetaWallet = "mn_test1qqvendor_beta_dashboard";

  let rfpId: string;
  let anonAlphaId: string;
  let anonBetaId: string;

  it("0. Setup: Create test tender and execute progressive submissions", async () => {
    const futureDeadline = new Date(Date.now() + 86400 * 7 * 1000).toISOString();

    const createRes = await createProcurementAction({
      title: "Dashboard Autonomous Fleet AI Hardware Procurement",
      description: "Encrypted procurement tender for autonomous vehicle AI perception nodes.",
      buyerAddress: buyerWallet,
      sector: "Autonomous Vehicles & AI",
      estimatedBudgetUsd: 18_000_000,
      evaluationCriteria: {
        technicalScoreWeight: 50,
        financialPriceWeight: 50,
        qualityScoreWeight: 0,
        scoringMethod: "MEAT",
      },
      eligibilityThresholds: {
        minTurnoverUsd: 5_000_000,
        minExperienceYears: 3,
        minFacilitiesCount: 1,
        requiredCertifications: ["ISO 9001"],
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
        warrantyYears: 2,
        penaltyClause: "0.5% per day",
      },
    });

    assert.equal(createRes.success, true);
    rfpId = createRes.rfp!.id;

    // Vendor Alpha Stage 1 & Stage 2
    const stg1Alpha = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendorAlphaWallet,
      vendorTurnoverUsd: 12_000_000,
      vendorExperienceYears: 5,
    });
    anonAlphaId = stg1Alpha.anonymousBidderId!;

    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: anonAlphaId,
      technicalSpecs: "Dual LiDAR + 4K Camera Vision Coprocessor.",
      methodology: "ISO 26262 functional safety methodology.",
      deliveryTimelineDays: 45,
      equipmentSummary: "Automotive-grade SMT assembly line.",
    });
    await evaluateStage2TechnicalAction({
      procurementId: rfpId,
      anonymousBidderId: anonAlphaId,
      status: "PASSED",
      technicalScore: 92,
    });

    // Vendor Beta Stage 1 & Stage 2
    const stg1Beta = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendorBetaWallet,
      vendorTurnoverUsd: 15_000_000,
      vendorExperienceYears: 7,
    });
    anonBetaId = stg1Beta.anonymousBidderId!;

    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: anonBetaId,
      technicalSpecs: "Solid-state FMCW LiDAR Perception Unit.",
      methodology: "Cleanroom optical packaging.",
      deliveryTimelineDays: 50,
      equipmentSummary: "Optical alignment station.",
    });
    await evaluateStage2TechnicalAction({
      procurementId: rfpId,
      anonymousBidderId: anonBetaId,
      status: "PASSED",
      technicalScore: 88,
    });

    // Stage 3 Commercial Bids
    await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: anonAlphaId,
      bidAmountUsd: 16_500_000,
    });

    await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: anonBetaId,
      bidAmountUsd: 15_800_000,
    });

    // Award Winner via Compact ZK
    await evaluateStage3AwardAction({
      procurementId: rfpId,
    });
  });

  it("1. Buyer Dashboard Action: Calculate real-time procurement metrics", async () => {
    const stats = await getBuyerProcurementStatsAction(buyerWallet);

    assert.ok(stats.activeProcurementsCount >= 1);
    assert.ok(stats.totalEstimatedBudgetUsd >= 18_000_000);
    assert.ok(stats.totalSealedBidsReceived >= 2);
    assert.ok(stats.myProcurements.length >= 1);
  });

  it("2. Vendor Dashboard Action: Track confidential submissions via pseudonym ID", async () => {
    const resAlpha = await getVendorConfidentialSubmissionsAction(vendorAlphaWallet);

    assert.ok(resAlpha.submissions.length >= 1);
    const item = resAlpha.submissions.find((s) => s.procurement.id === rfpId);
    assert.ok(item);
    assert.equal(item?.anonymousBidderId, anonAlphaId);
    assert.equal(item?.stage1Status?.isEligible, true);
    assert.equal(item?.stage2Status?.status, "PASSED");
    assert.equal(item?.stage3Status?.bidAmountUsd, 16_500_000);

    // Verify Vendor Alpha pseudonym does NOT reveal wallet address
    assert.equal(item?.anonymousBidderId.includes(vendorAlphaWallet), false);
  });

  it("3. Auditor Dashboard Action: Selective disclosure ZK audit verification without raw document or price leakage", async () => {
    const auditRes = await getAuditorIntegrityReportsAction();

    assert.ok(auditRes.auditReports.length >= 1);

    const awardAudit = auditRes.auditReports.find(
      (a) => a.procurementId === rfpId && a.circuitName === "evaluate_winning_bid font-mono" || a.circuitName === "evaluate_winning_bid"
    );
    assert.ok(awardAudit);
    assert.equal(awardAudit?.losingBidsProtected, true);
    assert.ok(awardAudit?.proofHash.startsWith("0xzk_proof_award_"));
    assert.equal(awardAudit?.verificationKeyHash, "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0");

    // Execute Auditor ZK proof verification
    const verifyRes = await verifyAuditorProofAction(awardAudit!.auditId);
    assert.equal(verifyRes.success, true);
    assert.ok(verifyRes.message.includes("verified cleanly"));
  });
});
