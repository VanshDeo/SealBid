"use server";

import type {
  VendorProfile,
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

/**
 * Server Action: Generates a Reusable Business Credential Passport ("RAW DATA != PROOF OF FACT").
 * Certifies turnover tiers and accreditation commitments so vendors can reuse them across RFPs.
 */
export async function generateReusableCredentialPassportAction(
  profile: VendorProfile,
  vendorId: string,
  walletAddress: string
): Promise<{
  success: boolean;
  passport?: import("@/lib/types").ReusableBusinessCredentialPassport;
  error?: string;
}> {
  try {
    const storage = new EncryptedVendorStorage();
    const passport = await storage.generateReusableCredentialPassport(
      profile,
      vendorId,
      walletAddress
    );

    return {
      success: true,
      passport,
    };
  } catch (error) {
    console.error("[vendor-actions] Failed to generate reusable credential passport:", error);
    return { success: false, error: "Failed to generate reusable credential passport." };
  }
}

/**
 * Server Action: Generates a verifiable Zero-Knowledge Proof of Fact from a reusable credential passport.
 */
export async function verifyCredentialFactProofAction(
  passport: import("@/lib/types").ReusableBusinessCredentialPassport,
  requiredTurnoverUsd: number,
  requiredExperienceYears: number,
  requiredCertifications: string[] = []
): Promise<{
  success: boolean;
  factProof?: import("@/lib/types").CredentialFactProof;
  error?: string;
}> {
  try {
    const storage = new EncryptedVendorStorage();
    const factProof = await storage.generateCredentialFactProof(
      passport,
      requiredTurnoverUsd,
      requiredExperienceYears,
      requiredCertifications
    );

    return {
      success: true,
      factProof,
    };
  } catch (error) {
    console.error("[vendor-actions] Failed to verify credential fact proof:", error);
    return { success: false, error: "Failed to verify credential fact proof." };
  }
}

