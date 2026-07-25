"use server";

import type {
  VendorProfile,
  EncryptedVendorProfile,
  QualificationCheckRequest,
  QualificationVerificationResult,
} from "@/lib/types";
import { PROOF_STATUS } from "@/lib/constants";
import { EncryptedVendorStorage } from "@/storage/vendor-storage";




export interface RegisterVendorPayload {
  walletAddress: string;
  profile: VendorProfile;
}

export interface RegisterVendorResponse {
  success: boolean;
  vendorId?: string;
  transactionHash?: string;
  commitments?: {
    profileCommitment: string;
    turnoverHash: string;
    certificationsHash: string;
  };
  error?: string;
}

/**
 * Server Action to handle confidential vendor registration.
 * Off-chain data is encrypted locally; commitments and verification hashes are submitted on-chain.
 */
export async function registerVendorAction(
  payload: RegisterVendorPayload
): Promise<RegisterVendorResponse> {
  try {
    if (!payload.walletAddress || !payload.profile.companyName) {
      return {
        success: false,
        error: "Missing required wallet address or company information.",
      };
    }

    // Generate unique vendor ID
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const storage = new EncryptedVendorStorage();
    const commitments = await storage.computeProfileCommitments(payload.profile, vendorId);

    // Simulate ZK circuit execution delay & Midnight transaction broadcast
    await new Promise((resolve) => setTimeout(resolve, 800));

    const transactionHash = `0xtx_vendor_reg_${Math.random().toString(36).slice(2, 20)}`;

    return {
      success: true,
      vendorId,
      transactionHash,
      commitments,
    };
  } catch (error) {
    console.error("[vendor-actions] Failed to register vendor profile:", error);
    return {
      success: false,
      error: "Server failed to process vendor registration commitment.",
    };
  }
}

/**
 * Server Action for Zero-Knowledge Qualification Verification.
 * Evaluates whether vendor meets specified RFP turnover and experience requirements.
 */
export async function verifyVendorQualificationAction(
  request: QualificationCheckRequest,
  actualTurnoverUsd: number,
  actualExperienceYears: number
): Promise<QualificationVerificationResult> {
  // Simulate ZK proof generation delay
  await new Promise((resolve) => setTimeout(resolve, 700));

  const turnoverSatisfied = actualTurnoverUsd >= request.requiredTurnoverUsd;
  const experienceSatisfied = actualExperienceYears >= request.requiredExperienceYears;
  const isQualified = turnoverSatisfied && experienceSatisfied;

  const proofHash = `0xzk_proof_qual_${Math.random().toString(36).slice(2, 22)}`;

  return {
    vendorId: request.vendorId,
    isQualified,
    proofStatus: isQualified ? PROOF_STATUS.VERIFIED : PROOF_STATUS.FAILED,
    proofHash,
    timestamp: new Date().toISOString(),
    details: {
      turnoverSatisfied,
      experienceSatisfied,
    },
  };
}
