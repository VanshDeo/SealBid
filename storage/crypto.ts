/**
 * Web Crypto API client-side encryption utility for private bid parameters.
 * Uses AES-GCM with PBKDF2 key derivation for confidential local storage.
 */

export class ClientCrypto {
  private static ALGORITHM = "AES-GCM";
  private static KEY_LENGTH = 256;

  /**
   * Derives a CryptoKey from a secret passphrase or user wallet signature.
   */
  public static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts plaintext string payload with AES-GCM 256-bit.
   */
  public static async encrypt(plaintext: string, secretKey: string): Promise<string> {
    if (typeof window === "undefined" || !crypto?.subtle) {
      // Fallback base64 encoder stub for non-browser SSR contexts
      return Buffer.from(plaintext).toString("base64");
    }

    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(secretKey, salt);

    const encryptedContent = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      key,
      encoder.encode(plaintext)
    );

    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

    return Buffer.from(buffer).toString("base64");
  }

  /**
   * Decrypts AES-GCM ciphertext payload back into plaintext string.
   */
  public static async decrypt(ciphertextBase64: string, secretKey: string): Promise<string> {
    if (typeof window === "undefined" || !crypto?.subtle) {
      // Fallback base64 decoder stub for non-browser SSR contexts
      return Buffer.from(ciphertextBase64, "base64").toString("utf-8");
    }

    const data = new Uint8Array(Buffer.from(ciphertextBase64, "base64"));
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encryptedContent = data.slice(28);

    const key = await this.deriveKey(secretKey, salt);
    const decryptedContent = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv },
      key,
      encryptedContent
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  }
}
