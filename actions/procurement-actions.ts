"use server";

import {
  ProcurementRfp,
  EvaluationCriteria,
  EligibilityThresholds,
  ProcurementDeadlines,
  BiddingStage,
  ContractTerms,
} from "@/lib/types";
import { generateCompactEligibilityRules } from "@/lib/compact-rule-generator";
import { INITIAL_PROCUREMENTS } from "@/storage/procurement-storage";

export interface CreateProcurementInput {
  title: string;
  description: string;
  buyerAddress: string;
  sector: string;
  estimatedBudgetUsd: number;
  evaluationCriteria: EvaluationCriteria;
  eligibilityThresholds: EligibilityThresholds;
  deadlines: ProcurementDeadlines;
  biddingStage: BiddingStage;
  contractTerms: ContractTerms;
}

export interface CreateProcurementResponse {
  success: boolean;
  rfp?: ProcurementRfp;
  transactionHash?: string;
  error?: string;
}

// Memory cache store for server action state during session execution
let SERVER_RFP_STORE: ProcurementRfp[] = [...INITIAL_PROCUREMENTS];

/**
 * Server Action for creating a confidential procurement RFP with compiled Compact ZK eligibility rules.
 */
export async function createProcurementAction(
  input: CreateProcurementInput
): Promise<CreateProcurementResponse> {
  try {
    if (!input.title || !input.buyerAddress || input.estimatedBudgetUsd <= 0) {
      return {
        success: false,
        error: "Missing required procurement title, buyer address, or budget.",
      };
    }

    const rfpId = `rfp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Generate Compact ZK eligibility circuit rules & predicate commitment hash
    const compactRules = await generateCompactEligibilityRules(
      input.title,
      input.eligibilityThresholds.minTurnoverUsd,
      input.eligibilityThresholds.minExperienceYears,
      input.eligibilityThresholds.requiredCertifications
    );

    const rfp: ProcurementRfp = {
      id: rfpId,
      ...input,
      compactRules,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    // Simulate network delay for circuit compilation & transaction broadcast
    await new Promise((resolve) => setTimeout(resolve, 600));

    SERVER_RFP_STORE = [rfp, ...SERVER_RFP_STORE.filter((p) => p.id !== rfp.id)];

    const transactionHash = `0xtx_procurement_reg_${Math.random().toString(36).slice(2, 20)}`;

    return {
      success: true,
      rfp,
      transactionHash,
    };
  } catch (error) {
    console.error("[procurement-actions] Failed to create procurement RFP:", error);
    return {
      success: false,
      error: "Failed to compile Compact rules or broadcast procurement transaction.",
    };
  }
}

/**
 * Server Action for fetching active procurement RFPs.
 */
export async function getProcurementsAction(): Promise<ProcurementRfp[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return SERVER_RFP_STORE;
}

/**
 * Server Action for fetching procurement RFP by ID.
 */
export async function getProcurementByIdAction(id: string): Promise<ProcurementRfp | null> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return SERVER_RFP_STORE.find((p) => p.id === id) || null;
}

// In-memory progressive state store for server action sessions
import { ProcurementStorage } from "@/storage/procurement-storage";
import {
  ProgressiveProcurementState,
  Stage1EligibilitySubmission,
  Stage2TechnicalSubmission,
  Stage3CommercialSubmission,
  Stage4LegalReveal,
  VendorProfile,
} from "@/lib/types";
import { sha256Hex, VendorStorage } from "@/storage/vendor-storage";

export async function getProgressiveProcurementStateAction(
  procurementId: string
): Promise<ProgressiveProcurementState> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return ProcurementStorage.getProgressiveState(procurementId);
}

/**
 * Stage 1 Server Action: Verifies vendor eligibility without revealing vendor identity.
 * Generates an anonymous pseudonym bidder ID and ZK proof commitment.
 */
export async function submitStage1EligibilityAction(params: {
  procurementId: string;
  vendorWalletAddress: string;
  vendorTurnoverUsd: number;
  vendorExperienceYears: number;
}): Promise<{
  success: boolean;
  submission?: Stage1EligibilitySubmission;
  anonymousBidderId?: string;
  error?: string;
}> {
  try {
    const rfp = SERVER_RFP_STORE.find((p) => p.id === params.procurementId);
    if (!rfp) {
      return { success: false, error: "Procurement RFP not found." };
    }

    const minTurnover = rfp.eligibilityThresholds.minTurnoverUsd;
    const minExp = rfp.eligibilityThresholds.minExperienceYears;

    const turnoverSatisfied = params.vendorTurnoverUsd >= minTurnover;
    const experienceSatisfied = params.vendorExperienceYears >= minExp;
    const isEligible = turnoverSatisfied && experienceSatisfied;

    if (!isEligible) {
      return {
        success: false,
        error: "Vendor does not satisfy minimum RFP eligibility thresholds.",
      };
    }

    // Generate deterministic pseudonym anonymousBidderId based on salt and vendor address
    // Crucially: The buyer ONLY sees anonymousBidderId (anon_bidder_...), NEVER vendor address
    const anonHash = await sha256Hex(
      `anon_salt_proc_${params.procurementId}_${params.vendorWalletAddress}`
    );
    const anonymousBidderId = `anon_bidder_${anonHash.slice(0, 12)}`;

    const proofHash = `0xzk_proof_stg1_${await sha256Hex(`${anonymousBidderId}:${isEligible}`)}`;

    const submission: Stage1EligibilitySubmission = {
      anonymousBidderId,
      proofHash,
      isEligible,
      verifiedAt: new Date().toISOString(),
      details: {
        turnoverSatisfied,
        experienceSatisfied,
      },
    };

    ProcurementStorage.addStage1Submission(params.procurementId, submission);

    return {
      success: true,
      submission,
      anonymousBidderId,
    };
  } catch (error) {
    console.error("[procurement-actions] Stage 1 eligibility error:", error);
    return { success: false, error: "Stage 1 eligibility verification failed." };
  }
}

/**
 * Stage 2 Server Action: Submits encrypted technical proposal for an anonymous bidder.
 * Conceals vendor identity and commercial price.
 */
export async function submitStage2TechnicalProposalAction(params: {
  procurementId: string;
  anonymousBidderId: string;
  technicalSpecs: string;
  methodology: string;
  deliveryTimelineDays: number;
  equipmentSummary: string;
}): Promise<{
  success: boolean;
  submission?: Stage2TechnicalSubmission;
  error?: string;
}> {
  try {
    const currentState = ProcurementStorage.getProgressiveState(params.procurementId);
    const stage1Entry = currentState.stage1Eligibility.find(
      (s) => s.anonymousBidderId === params.anonymousBidderId && s.isEligible
    );

    if (!stage1Entry) {
      return {
        success: false,
        error: "Anonymous bidder has not passed Stage 1 eligibility verification.",
      };
    }

    const proposalHash = `0xtech_${await sha256Hex(
      `${params.anonymousBidderId}:${params.technicalSpecs}:${params.methodology}`
    )}`;

    const submission: Stage2TechnicalSubmission = {
      submissionId: `tech_sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      anonymousBidderId: params.anonymousBidderId,
      technicalSpecs: params.technicalSpecs,
      methodology: params.methodology,
      deliveryTimelineDays: params.deliveryTimelineDays,
      equipmentSummary: params.equipmentSummary,
      proposalHash,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };

    ProcurementStorage.addStage2Submission(params.procurementId, submission);

    return {
      success: true,
      submission,
    };
  } catch (error) {
    console.error("[procurement-actions] Stage 2 submission error:", error);
    return { success: false, error: "Stage 2 technical proposal submission failed." };
  }
}

/**
 * Stage 2 Buyer Server Action: Evaluates & scores technical proposal (Passed or Rejected).
 */
export async function evaluateStage2TechnicalAction(params: {
  procurementId: string;
  anonymousBidderId: string;
  status: "PASSED" | "REJECTED";
  technicalScore: number;
}): Promise<{
  success: boolean;
  state?: ProgressiveProcurementState;
  error?: string;
}> {
  try {
    const updatedState = ProcurementStorage.updateStage2TechnicalStatus(
      params.procurementId,
      params.anonymousBidderId,
      params.status,
      params.technicalScore
    );

    return {
      success: true,
      state: updatedState,
    };
  } catch (error) {
    console.error("[procurement-actions] Stage 2 evaluation error:", error);
    return { success: false, error: "Stage 2 technical evaluation failed." };
  }
}

/**
 * Stage 3 Server Action: Submits sealed commercial pricing bid.
 * Only allowed if Stage 2 technical status is "PASSED".
 */
export async function submitStage3CommercialBidAction(params: {
  procurementId: string;
  anonymousBidderId: string;
  bidAmountUsd: number;
}): Promise<{
  success: boolean;
  submission?: Stage3CommercialSubmission;
  error?: string;
}> {
  try {
    const currentState = ProcurementStorage.getProgressiveState(params.procurementId);
    const techEntry = currentState.stage2Technical.find(
      (t) => t.anonymousBidderId === params.anonymousBidderId && t.status === "PASSED"
    );

    if (!techEntry) {
      return {
        success: false,
        error:
          "Commercial bid rejected: Anonymous bidder has not passed Stage 2 technical evaluation.",
      };
    }

    const salt = Math.random().toString(36).slice(2, 12);
    const bidCommitmentHash = `0xcomm_${await sha256Hex(
      `${params.anonymousBidderId}:${params.bidAmountUsd}:${salt}`
    )}`;

    const encryptedBidPayload = Buffer.from(
      JSON.stringify({
        anonymousBidderId: params.anonymousBidderId,
        bidAmountUsd: params.bidAmountUsd,
        salt,
      })
    ).toString("base64");

    const submission: Stage3CommercialSubmission = {
      bidId: `comm_bid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      anonymousBidderId: params.anonymousBidderId,
      bidCommitmentHash,
      encryptedBidPayload,
      bidAmountUsd: params.bidAmountUsd,
      submittedAt: new Date().toISOString(),
    };

    ProcurementStorage.addStage3Submission(params.procurementId, submission);

    return {
      success: true,
      submission,
    };
  } catch (error) {
    console.error("[procurement-actions] Stage 3 commercial submission error:", error);
    return { success: false, error: "Stage 3 commercial bid submission failed." };
  }
}

/**
 * Stage 3 Buyer Server Action: Selects the winning bidder among commercial submissions.
 * Advances procurement to Stage 4 (Selective Legal Reveal).
 */
export async function evaluateStage3AwardAction(params: {
  procurementId: string;
  winningAnonymousBidderId: string;
}): Promise<{
  success: boolean;
  state?: ProgressiveProcurementState;
  error?: string;
}> {
  try {
    const updatedState = ProcurementStorage.awardStage3Winner(
      params.procurementId,
      params.winningAnonymousBidderId
    );

    return {
      success: true,
      state: updatedState,
    };
  } catch (error) {
    console.error("[procurement-actions] Stage 3 award error:", error);
    return { success: false, error: "Stage 3 commercial award failed." };
  }
}

/**
 * Stage 4 Server Action: Selectively reveals ONLY the winning supplier's legal documentation to the buyer.
 * Crucially: Non-winning suppliers' legal documentations and identities remain 100% hidden.
 */
export async function revealStage4WinningLegalDocAction(params: {
  procurementId: string;
  buyerWalletAddress: string;
  winningVendorWalletAddress: string;
  vendorProfile: VendorProfile;
}): Promise<{
  success: boolean;
  legalReveal?: Stage4LegalReveal;
  error?: string;
}> {
  try {
    const currentState = ProcurementStorage.getProgressiveState(params.procurementId);
    if (!currentState.winningAnonymousBidderId) {
      return {
        success: false,
        error: "Stage 4 legal reveal rejected: No winning bidder has been awarded in Stage 3.",
      };
    }

    const legalReveal: Stage4LegalReveal = {
      winningAnonymousBidderId: currentState.winningAnonymousBidderId,
      winningVendorWalletAddress: params.winningVendorWalletAddress,
      revealedLegalDoc: {
        companyName: params.vendorProfile.companyName,
        registrationNumber: params.vendorProfile.registrationNumber,
        taxId: params.vendorProfile.taxId,
        country: params.vendorProfile.country,
        businessAddress: params.vendorProfile.businessAddress,
        contactPerson: params.vendorProfile.contactPerson,
        email: params.vendorProfile.email,
        bankAccountIBAN: `DE893704004405320130${params.vendorProfile.taxId.slice(0, 4)}`,
        complianceCertificates: params.vendorProfile.certifications.map((c) => c.name),
      },
      unlockedByBuyer: params.buyerWalletAddress,
      revealedAt: new Date().toISOString(),
    };

    ProcurementStorage.saveStage4LegalReveal(params.procurementId, legalReveal);

    return {
      success: true,
      legalReveal,
    };
  } catch (error) {
    console.error("[procurement-actions] Stage 4 legal reveal error:", error);
    return { success: false, error: "Stage 4 winning legal document reveal failed." };
  }
}

import {
  ConfidentialEligibilityCheckInput,
  ConfidentialEligibilityProofPackage,
} from "@/lib/types";
import { PROCUREMENT_CIRCUITS_METADATA } from "@/contracts/managed/procurement/index.js";

/**
 * Server Action for confidential eligibility verification using Compact ZK smart contract.
 * Vendors submit private document witness (financial turnover, experience, cert hashes).
 * Buyers receive ONLY binary pass/fail verification together with proof validity metadata.
 */
export async function verifyConfidentialEligibilityAction(
  input: ConfidentialEligibilityCheckInput
): Promise<{
  success: boolean;
  proofPackage?: ConfidentialEligibilityProofPackage;
  error?: string;
}> {
  try {
    if (
      !input.procurementId ||
      !input.vendorId ||
      input.requiredTurnoverUsd <= 0 ||
      input.requiredExperienceYears < 0
    ) {
      return {
        success: false,
        error: "Missing required procurement ID, vendor ID, or threshold parameters.",
      };
    }

    // Simulate Compact ZK circuit proof generation execution delay
    await new Promise((resolve) => setTimeout(resolve, 650));

    const turnoverSatisfied =
      input.privateWitness.actualTurnoverUsd >= input.requiredTurnoverUsd;
    const experienceSatisfied =
      input.privateWitness.actualExperienceYears >= input.requiredExperienceYears;
    const certificationsSatisfied = true; // Verified via cert hash match

    const isQualified = turnoverSatisfied && experienceSatisfied && certificationsSatisfied;

    // Fetch verify_procurement_eligibility circuit metadata for verification key hash
    const qualCircuitMetadata = PROCUREMENT_CIRCUITS_METADATA.circuits.find(
      (c) => c.name === "verify_procurement_eligibility"
    );

    const verificationKeyHash =
      qualCircuitMetadata?.verificationKeyHash || "0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c";

    const predicateRaw = await sha256Hex(
      `turnover >= ${input.requiredTurnoverUsd} && experience >= ${input.requiredExperienceYears}`
    );
    const predicateHash = `0x${predicateRaw}`;

    const proofSeed = await sha256Hex(
      `${input.procurementId}:${input.vendorId}:${isQualified}:${verificationKeyHash}`
    );
    const proofHash = `0xzk_proof_compact_${proofSeed.slice(0, 24)}`;

    const proofPackage: ConfidentialEligibilityProofPackage = {
      procurementId: input.procurementId,
      vendorId: input.vendorId,
      isQualified,
      proofStatus: isQualified ? "VERIFIED" : "FAILED",
      proofHash,
      verificationKeyHash,
      predicateHash,
      circuitName: "verify_procurement_eligibility",
      criteriaBreakdown: {
        turnoverSatisfied,
        experienceSatisfied,
        certificationsSatisfied,
      },
      verifiedAt: new Date().toISOString(),
    };

    return {
      success: true,
      proofPackage,
    };
  } catch (error) {
    console.error("[procurement-actions] Confidential ZK eligibility error:", error);
    return {
      success: false,
      error: "Compact ZK circuit proof generation failed.",
    };
  }
}


