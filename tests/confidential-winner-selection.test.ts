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
} from "../actions/procurement-actions";
import { ProcurementStorage } from "../storage/procurement-storage";
import { ProcurementContractService } from "../midnight/services/procurement-contract-service";

describe("Compact Confidential Winner Selection & Immutable Audit Trail Test Suite", () => {
  const buyerWallet = "mn_test1qqbuyer_winner_selection_001";
  const vendorAlphaWallet = "mn_test1qqvendor_alpha_winner";
  const vendorBetaWallet = "mn_test1qqvendor_beta_winner";
  const vendorGammaWallet = "mn_test1qqvendor_gamma_winner";

  let rfpId: string;
  let anonAlphaId: string;
  let anonBetaId: string;
  let anonGammaId: string;

  it("1. Compact Circuit Metadata Verification: Must include evaluate_winning_bid circuit", () => {
    assert.equal(PROCUREMENT_CIRCUITS_METADATA.circuits.length, 6);

    const circuitNames = PROCUREMENT_CIRCUITS_METADATA.circuits.map((c) => c.name);
    assert.ok(circuitNames.includes("evaluate_winning_bid"));

    const evalCircuit = PROCUREMENT_CIRCUITS_METADATA.circuits.find(
      (c) => c.name === "evaluate_winning_bid"
    );
    assert.ok(evalCircuit);
    assert.equal(evalCircuit?.inputsCount, 4);
    assert.ok(evalCircuit?.verificationKeyHash.startsWith("0x"));
  });

  it("2. Setup Multi-Vendor Tender Workflow: Complete Stage 1 & Stage 2 for 3 qualified bidders", async () => {
    const futureDeadline = new Date(Date.now() + 86400 * 7 * 1000).toISOString();

    const createRes = await createProcurementAction({
      title: "Confidential Satellite Optical Payload Procurement",
      description: "Predefined MEAT scoring rules tender for satellite laser communications payload.",
      buyerAddress: buyerWallet,
      sector: "Aerospace & Satellites",
      estimatedBudgetUsd: 30_000_000,
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
        deliveryTimelineDays: 120,
        warrantyYears: 2,
        penaltyClause: "0.5% per week",
      },
    });

    assert.equal(createRes.success, true);
    rfpId = createRes.rfp!.id;

    // Vendor Alpha (Turnover $20M, Exp 8 years)
    const stg1Alpha = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendorAlphaWallet,
      vendorTurnoverUsd: 20_000_000,
      vendorExperienceYears: 8,
    });
    anonAlphaId = stg1Alpha.anonymousBidderId!;

    // Vendor Beta (Turnover $25M, Exp 10 years)
    const stg1Beta = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendorBetaWallet,
      vendorTurnoverUsd: 25_000_000,
      vendorExperienceYears: 10,
    });
    anonBetaId = stg1Beta.anonymousBidderId!;

    // Vendor Gamma (Turnover $15M, Exp 6 years)
    const stg1Gamma = await submitStage1EligibilityAction({
      procurementId: rfpId,
      vendorWalletAddress: vendorGammaWallet,
      vendorTurnoverUsd: 15_000_000,
      vendorExperienceYears: 6,
    });
    anonGammaId = stg1Gamma.anonymousBidderId!;

    // Stage 2 Technical proposals & scoring:
    // Alpha: Tech Score 96
    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: anonAlphaId,
      technicalSpecs: "10 Gbps space laser transceiver with 0.1 arcsec pointing jitter.",
      methodology: "Cleanroom optoelectronic integration.",
      deliveryTimelineDays: 90,
      equipmentSummary: "Interferometric alignment bench.",
    });
    await evaluateStage2TechnicalAction({
      procurementId: rfpId,
      anonymousBidderId: anonAlphaId,
      status: "PASSED",
      technicalScore: 96,
    });

    // Beta: Tech Score 85
    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: anonBetaId,
      technicalSpecs: "5 Gbps laser communications unit.",
      methodology: "Robotic assembly.",
      deliveryTimelineDays: 100,
      equipmentSummary: "Optical test bench.",
    });
    await evaluateStage2TechnicalAction({
      procurementId: rfpId,
      anonymousBidderId: anonBetaId,
      status: "PASSED",
      technicalScore: 85,
    });

    // Gamma: Tech Score 90
    await submitStage2TechnicalProposalAction({
      procurementId: rfpId,
      anonymousBidderId: anonGammaId,
      technicalSpecs: "8 Gbps optical link module.",
      methodology: "Manual precision assembly.",
      deliveryTimelineDays: 110,
      equipmentSummary: "Cleanroom Class 100.",
    });
    await evaluateStage2TechnicalAction({
      procurementId: rfpId,
      anonymousBidderId: anonGammaId,
      status: "PASSED",
      technicalScore: 90,
    });
  });

  it("3. Stage 3 Commercial Bids: Submit sealed commercial prices for all 3 bidders", async () => {
    // Alpha: $24,000,000 USD
    await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: anonAlphaId,
      bidAmountUsd: 24_000_000,
    });

    // Beta: $21,000,000 USD (Lowest price, but lower technical score 85)
    await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: anonBetaId,
      bidAmountUsd: 21_000_000,
    });

    // Gamma: $27,000,000 USD
    await submitStage3CommercialBidAction({
      procurementId: rfpId,
      anonymousBidderId: anonGammaId,
      bidAmountUsd: 27_000_000,
    });
  });

  it("4. Predefined Rule Winner Evaluation & Immutable Audit Trail Generation", async () => {
    const awardRes = await evaluateStage3AwardAction({
      procurementId: rfpId,
    });

    assert.equal(awardRes.success, true);
    assert.ok(awardRes.auditTrail);
    assert.equal(awardRes.auditTrail.winningAnonymousBidderId, anonAlphaId);
    assert.equal(awardRes.auditTrail.totalBidsEvaluated, 3);
    assert.equal(awardRes.auditTrail.losingBidCount, 2);
    assert.equal(awardRes.auditTrail.losingBidsPrivacyProtected, true);

    // Verify Audit Trail Hashes & Cryptographic Signatures
    assert.ok(awardRes.auditTrail.proofHash.startsWith("0xzk_proof_award_"));
    assert.equal(awardRes.auditTrail.verificationKeyHash, "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0");
    assert.ok(awardRes.auditTrail.ruleCommitmentHash.startsWith("0xrule_"));
    assert.ok(awardRes.auditTrail.fairnessProofSignature.startsWith("0xsig_fairness_"));

    // Verify state updated in storage
    const state = ProcurementStorage.getProgressiveState(rfpId);
    assert.equal(state.currentStage, "STAGE_4_LEGAL_REVEAL");
    assert.equal(state.winningAnonymousBidderId, anonAlphaId);
    assert.ok(state.winnerAuditTrail);
  });

  it("5. Confidentiality Verification: Losing bid figures MUST remain concealed", () => {
    const state = ProcurementStorage.getProgressiveState(rfpId);
    const auditTrail = state.winnerAuditTrail!;

    // Confirm that the published audit trail reveals ONLY the winner's pseudonym
    assert.equal(auditTrail.winningAnonymousBidderId, anonAlphaId);

    // Confirm losing bid count is 2 and privacy is flagged protected
    assert.equal(auditTrail.losingBidCount, 2);
    assert.equal(auditTrail.losingBidsPrivacyProtected, true);
  });

  it("6. Midnight ProcurementContractService: Validate evaluateWinningBid circuit execution rules", async () => {
    const mockProviders = {
      wallet: {
        getAccount: async () => ({ address: "mn_test1qqmock_address_001" }),
        submitTx: async () => ({ txHash: "0xtx_mock_123" }),
      } as any,
      proof: {
        generateProof: async () => ({ proofHash: "0xproof_mock_123" }),
      } as any,
      publicData: {
        getTransactionStatus: async () => ({ status: "SUCCESS" }),
      } as any,
      privateState: {
        getPrivateState: async () => null,
        setPrivateState: async () => {},
      } as any,
      privateStateProvider: {} as any,
      publicDataProvider: {} as any,
      zkConfigProvider: {} as any,
      proofProvider: {} as any,
      walletProvider: {} as any,
    };

    const service = new ProcurementContractService(mockProviders, "0xcontract_address_test_123");

    // Test rejection when total bids is 0
    await assert.rejects(
      async () => {
        await service.evaluateWinningBid("rfp_test", 0, "anon_1", "0xrule", []);
      },
      /Cannot evaluate winner with zero commercial bids/
    );

    // Test rejection when winner is not in candidates list
    await assert.rejects(
      async () => {
        await service.evaluateWinningBid("rfp_test", 1, "anon_missing", "0xrule", [
          { anonymousBidderId: "anon_present", commitmentHash: "0xcomm1" },
        ]);
      },
      /Selected winner is not present in submitted commercial bids list/
    );

    // Test successful execution
    const circuitRes = await service.evaluateWinningBid("rfp_test", 2, "anon_winner", "0xrule123", [
      { anonymousBidderId: "anon_winner", commitmentHash: "0xcomm1" },
      { anonymousBidderId: "anon_losing", commitmentHash: "0xcomm2" },
    ]);

    assert.ok(circuitRes.txHash);
    assert.ok(circuitRes.proof);
  });
});
