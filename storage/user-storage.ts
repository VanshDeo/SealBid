import { STORAGE_KEYS } from "../lib/constants";
import type { PrivateBusinessInfo, PublicUserProfile, UserRole } from "../lib/types";
import { ClientCrypto } from "./crypto";



/**
 * Off-Chain Encrypted Storage for Private User Business Information.
 * Uses AES-GCM 256 client-side encryption linked to Lace Wallet public addresses.
 */
export class EncryptedUserStorage {
  /**
   * Computes SHA-256 hash digest of stringified private payload.
   */
  public static async computeDataHash(data: unknown): Promise<string> {
    const jsonStr = JSON.stringify(data);
    if (typeof window !== "undefined" && crypto?.subtle) {
      const msgBuffer = new TextEncoder().encode(jsonStr);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback hash implementation for SSR or test runners
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
  }

  /**
   * Saves minimum public profile and encrypted off-chain private business info.
   */
  public static async saveUserProfile(
    walletAddress: string,
    role: UserRole,
    displayName: string,
    privateInfo: PrivateBusinessInfo,
    passphrase?: string
  ): Promise<{ profile: PublicUserProfile; encryptedBlob: string }> {
    const dataHash = await this.computeDataHash(privateInfo);
    const registeredAt = new Date().toISOString();

    const publicProfile: PublicUserProfile = {
      walletAddress,
      role,
      displayName,
      registeredAt,
      dataHash,
    };

    const secretKey = passphrase || walletAddress;
    const jsonPayload = JSON.stringify(privateInfo);
    const encryptedBlob = await ClientCrypto.encrypt(jsonPayload, secretKey);

    if (typeof window !== "undefined") {
      // 1. Update public profiles registry
      const existingProfiles = this.getAllPublicProfiles();
      const updatedProfiles = [
        ...existingProfiles.filter(
          (p) => p.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
        ),
        publicProfile,
      ];
      localStorage.setItem(STORAGE_KEYS.PUBLIC_PROFILES, JSON.stringify(updatedProfiles));

      // 2. Save encrypted private business info off-chain
      const userStorageKey = `${STORAGE_KEYS.ENCRYPTED_USER_INFO}_${walletAddress.toLowerCase()}`;
      localStorage.setItem(userStorageKey, encryptedBlob);
    }

    return { profile: publicProfile, encryptedBlob };
  }

  /**
   * Retrieves public user profile by wallet address.
   */
  public static getPublicProfile(walletAddress: string): PublicUserProfile | null {
    if (typeof window === "undefined") return null;
    const profiles = this.getAllPublicProfiles();
    return (
      profiles.find((p) => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()) || null
    );
  }

  /**
   * Retrieves all registered minimum public user profiles.
   */
  public static getAllPublicProfiles(): PublicUserProfile[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROFILES);
      if (!raw) return [];
      return JSON.parse(raw) as PublicUserProfile[];
    } catch {
      return [];
    }
  }

  /**
   * Decrypts and returns off-chain private business info for a wallet.
   */
  public static async getPrivateBusinessInfo(
    walletAddress: string,
    passphrase?: string
  ): Promise<PrivateBusinessInfo | null> {
    if (typeof window === "undefined") return null;
    try {
      const userStorageKey = `${STORAGE_KEYS.ENCRYPTED_USER_INFO}_${walletAddress.toLowerCase()}`;
      const ciphertext = localStorage.getItem(userStorageKey);
      if (!ciphertext) return null;

      const secretKey = passphrase || walletAddress;
      const plaintext = await ClientCrypto.decrypt(ciphertext, secretKey);
      return JSON.parse(plaintext) as PrivateBusinessInfo;
    } catch (err) {
      console.error("[EncryptedUserStorage] Decryption error:", err);
      return null;
    }
  }

  /**
   * Gets raw ciphertext blob for inspection (e.g. proof of off-chain encryption).
   */
  public static getEncryptedBlob(walletAddress: string): string | null {
    if (typeof window === "undefined") return null;
    const userStorageKey = `${STORAGE_KEYS.ENCRYPTED_USER_INFO}_${walletAddress.toLowerCase()}`;
    return localStorage.getItem(userStorageKey);
  }

  /**
   * Clears stored profiles and encrypted data for testing.
   */
  public static clearUserStorage(walletAddress?: string): void {
    if (typeof window === "undefined") return;
    if (walletAddress) {
      const userStorageKey = `${STORAGE_KEYS.ENCRYPTED_USER_INFO}_${walletAddress.toLowerCase()}`;
      localStorage.removeItem(userStorageKey);
      const profiles = this.getAllPublicProfiles().filter(
        (p) => p.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
      );
      localStorage.setItem(STORAGE_KEYS.PUBLIC_PROFILES, JSON.stringify(profiles));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PUBLIC_PROFILES);
      // Remove all user info keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_KEYS.ENCRYPTED_USER_INFO)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}
