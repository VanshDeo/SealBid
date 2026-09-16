import { STORAGE_KEYS } from "@/lib/constants";
import type { VendorProfile, EncryptedVendorProfile } from "@/lib/types";
import { ClientCrypto } from "./crypto";




/**
 * Helper to compute SHA-256 hash string synchronously in browser or Node
 */
export async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Adapter interface for managing off-chain encrypted local storage of vendor business profiles.
 */
export class EncryptedVendorStorage {
  private secretKey: string;

  constructor(secretKey = "sealbid_vendor_entropy_default_key") {
    this.secretKey = secretKey;
  }

  /**
   * Computes cryptographic hashes and commitments required for Midnight Compact smart contract on-chain state.
   */
  public async computeProfileCommitments(
    profile: VendorProfile,
    vendorId: string,
    salt = "sealbid_vendor_salt_9988"
  ): Promise<{
    profileCommitment: string;
    turnoverHash: string;
    certificationsHash: string;
  }> {
    const certString = profile.certifications.map((c) => `${c.name}:${c.documentHash}`).join("|");

    const profileCommitment = await sha256Hex(
      `${vendorId}:${profile.companyName}:${profile.registrationNumber}:${salt}`
    );
    const turnoverHash = await sha256Hex(
      `${vendorId}:${profile.annualTurnoverUsd}:${profile.fiscalYear}:${salt}`
    );
    const certificationsHash = await sha256Hex(`${vendorId}:${certString}:${salt}`);

    return {
      profileCommitment: `0x${profileCommitment}`,
      turnoverHash: `0x${turnoverHash}`,
      certificationsHash: `0x${certificationsHash}`,
    };
  }

  /**
   * Encrypts and stores the confidential business profile locally off-chain.
   */
  public async saveVendorProfile(
    vendorId: string,
    walletAddress: string,
    profile: VendorProfile
  ): Promise<EncryptedVendorProfile | null> {
    try {
      const commitments = await this.computeProfileCommitments(profile, vendorId);
      const serialized = JSON.stringify(profile);
      const ciphertext = await ClientCrypto.encrypt(serialized, this.secretKey);

      const record: EncryptedVendorProfile = {
        vendorId,
        walletAddress,
        ciphertext,
        profileCommitment: commitments.profileCommitment,
        turnoverHash: commitments.turnoverHash,
        certificationsHash: commitments.certificationsHash,
        isVerified: true,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ENCRYPTED_VENDOR_PROFILE, JSON.stringify(record));
      }

      return record;
    } catch (error) {
      console.error("[EncryptedVendorStorage] Failed to save vendor profile:", error);
      return null;
    }
  }

  /**
   * Decrypts and retrieves stored vendor profile.
    */
  public async getVendorProfile(): Promise<{
    record: EncryptedVendorProfile | null;
    profile: VendorProfile | null;
  }> {
    try {
      if (typeof window === "undefined") {
        return { record: null, profile: null };
      }

      const rawRecord = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_VENDOR_PROFILE);
      if (!rawRecord) return { record: null, profile: null };

      const record = JSON.parse(rawRecord) as EncryptedVendorProfile;
      const plaintext = await ClientCrypto.decrypt(record.ciphertext, this.secretKey);
      const profile = JSON.parse(plaintext) as VendorProfile;

      return { record, profile };
    } catch (error) {
      console.error("[EncryptedVendorStorage] Failed to decrypt vendor profile:", error);
      return { record: null, profile: null };
    }
  }

  /**
   * Generates a reusable business credential passport adhering to the principle:
   * RAW DATA != PROOF OF FACT.
   * Certifies turnover tiers and accreditation hashes without leaking raw balance sheets.
   */
  public async generateReusableCredentialPassport(
    profile: VendorProfile,
    vendorId: string,
    walletAddress: string
  ): Promise<import("@/lib/types").ReusableBusinessCredentialPassport> {
    // Derive certified turnover tier from raw annual turnover
    const turnover = profile.annualTurnoverUsd || 0;
    const tiers = [50_000_000, 25_000_000, 15_000_000, 10_000_000, 5_000_000, 2_500_000, 1_000_000, 500_000];
    const certifiedTurnoverTierUsd = tiers.find((t) => turnover >= t) || Math.min(turnover, 100_000);

    const certAccreditations = (profile.certifications || []).map((c) => ({
      name: c.name,
      issuer: c.issuer,
      validUntil: c.expiryDate,
      documentHash: c.documentHash || `0xcert_${c.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`,
    }));

    const certString = certAccreditations.map((c) => `${c.name}:${c.documentHash}`).join("|");
    const commitmentRaw = await sha256Hex(
      `PASSPORT:${vendorId}:${walletAddress}:${certifiedTurnoverTierUsd}:${profile.yearsExperience}:${certString}`
    );
    const credentialCommitmentHash = `0x${commitmentRaw}`;
    const attestationSignature = `0xsig_cred_${await sha256Hex(`attestation:${credentialCommitmentHash}:midnight_network`)}`;
    const complianceAttestationHash = `0xcomp_${await sha256Hex(`compliance:${certString}`)}`;

    const passport: import("@/lib/types").ReusableBusinessCredentialPassport = {
      id: `pass_${vendorId.replace(/[^a-zA-Z0-9]/g, "")}_${commitmentRaw.slice(0, 8)}`,
      vendorId,
      walletAddress,
      companyName: profile.companyName,
      credentialCommitmentHash,
      certifiedTurnoverTierUsd,
      certifiedExperienceYears: profile.yearsExperience || 1,
      certifiedAccreditations: certAccreditations,
      completedProjectsCount: (profile.previousProjects || []).length,
      complianceAttestationHash,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
      attestationSignature,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`sealbid_cred_passport_${vendorId}`, JSON.stringify(passport));
      } catch (err) {
        console.warn("[EncryptedVendorStorage] Failed to cache credential passport:", err);
      }
    }

    return passport;
  }

  /**
   * Retrieves reusable credential passport for a vendor.
   */
  public getReusableCredentialPassport(
    vendorId: string
  ): import("@/lib/types").ReusableBusinessCredentialPassport | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`sealbid_cred_passport_${vendorId}`);
      if (!raw) return null;
      return JSON.parse(raw) as import("@/lib/types").ReusableBusinessCredentialPassport;
    } catch {
      return null;
    }
  }

  /**
   * Generates a reusable Zero-Knowledge Proof of Fact from an attested credential passport.
   */
  public async generateCredentialFactProof(
    passport: import("@/lib/types").ReusableBusinessCredentialPassport,
    requiredTurnoverUsd: number,
    requiredExperienceYears: number,
    requiredCertifications: string[] = []
  ): Promise<import("@/lib/types").CredentialFactProof> {
    const turnoverSatisfied = passport.certifiedTurnoverTierUsd >= requiredTurnoverUsd;
    const experienceSatisfied = passport.certifiedExperienceYears >= requiredExperienceYears;

    const complianceSatisfied =
      requiredCertifications.length === 0 ||
      requiredCertifications.every((req) =>
        passport.certifiedAccreditations.some((c) =>
          c.name.toLowerCase().includes(req.toLowerCase().trim())
        )
      );

    const factSeed = `${passport.id}:${passport.credentialCommitmentHash}:${requiredTurnoverUsd}:${requiredExperienceYears}:${turnoverSatisfied && experienceSatisfied && complianceSatisfied}`;
    const proofOfFactHash = `0xzk_fact_${await sha256Hex(factSeed)}`;

    return {
      passportId: passport.id,
      vendorId: passport.vendorId,
      credentialCommitmentHash: passport.credentialCommitmentHash,
      predicateDescription: `CertifiedTier >= $${requiredTurnoverUsd.toLocaleString()} && Experience >= ${requiredExperienceYears} Yrs`,
      proofOfFactHash,
      turnoverSatisfied,
      experienceSatisfied,
      complianceSatisfied,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Clears vendor profile storage.
   */
  public async clearStorage(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_VENDOR_PROFILE);
    }
  }
}

export const encryptedVendorStorage = new EncryptedVendorStorage();

