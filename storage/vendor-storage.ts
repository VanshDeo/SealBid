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
   * Clears vendor profile storage.
   */
  public async clearStorage(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_VENDOR_PROFILE);
    }
  }
}

export const encryptedVendorStorage = new EncryptedVendorStorage();
