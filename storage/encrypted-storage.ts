import { STORAGE_KEYS } from "@/lib/constants";
import { SealedBid } from "@/lib/types";
import { ClientCrypto } from "./crypto";

/**
 * Adapter interface for managing encrypted local storage of confidential sealed bids.
 */
export class EncryptedBidStorage {
  private userSecretKey: string;

  constructor(userSecretKey = "sealbid_default_client_entropy") {
    this.userSecretKey = userSecretKey;
  }

  /**
   * Encrypts and stores a local copy of a user's private bid parameters.
   */
  public async saveEncryptedBid(bid: SealedBid): Promise<boolean> {
    try {
      const existingBids = await this.getEncryptedBids();
      const updatedBids = [...existingBids.filter((b) => b.id !== bid.id), bid];

      const serialized = JSON.stringify(updatedBids);
      const ciphertext = await ClientCrypto.encrypt(serialized, this.userSecretKey);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ENCRYPTED_BIDS, ciphertext);
      }
      return true;
    } catch (error) {
      console.error("[EncryptedBidStorage] Failed to save encrypted bid:", error);
      return false;
    }
  }

  /**
   * Decrypts and retrieves stored private bids for the user.
   */
  public async getEncryptedBids(): Promise<SealedBid[]> {
    try {
      if (typeof window === "undefined") return [];
      const ciphertext = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_BIDS);
      if (!ciphertext) return [];

      const plaintext = await ClientCrypto.decrypt(ciphertext, this.userSecretKey);
      return JSON.parse(plaintext) as SealedBid[];
    } catch (error) {
      console.error("[EncryptedBidStorage] Failed to decrypt stored bids:", error);
      return [];
    }
  }

  /**
   * Clears stored encrypted bids for session cleanup.
   */
  public async clearStorage(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_BIDS);
    }
  }
}

export const encryptedBidStorage = new EncryptedBidStorage();
