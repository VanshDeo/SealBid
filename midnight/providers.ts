import { MidnightWalletConnector } from "./types";

/**
 * Midnight DApp Wallet Provider Abstraction (Lace / Midnight Wallet Extension).
 */
export class MidnightWalletAdapter implements MidnightWalletConnector {
  public name = "Midnight Lace Wallet";
  public icon = "/midnight-logo.svg";
  public apiVersion = "1.0.0";
  private connectedAddress: string | null = null;

  public async connect(): Promise<{ address: string; coinPublicKey: string }> {
    console.log("[MidnightWalletAdapter] Requesting Midnight Wallet Connection...");

    // Stub wallet connection response for DApp preview
    const dummyAddress = "mn_test1qqx79093eamxvgspg8p3pwn5q963g6vl82y7qg6k3r";
    const dummyCoinPk = "0xcoin_pk_88f910a27e6a7102b39f1c08d9e";

    this.connectedAddress = dummyAddress;

    return {
      address: dummyAddress,
      coinPublicKey: dummyCoinPk,
    };
  }

  public async disconnect(): Promise<void> {
    console.log("[MidnightWalletAdapter] Disconnected wallet.");
    this.connectedAddress = null;
  }

  public async signTransaction(txBytes: Uint8Array): Promise<Uint8Array> {
    console.log(`[MidnightWalletAdapter] Signing transaction payload (${txBytes.length} bytes)...`);
    return new Uint8Array([...txBytes, 0x01, 0x02, 0x03]);
  }

  public async getBalance(): Promise<bigint> {
    return 10_000_000_000n; // 10,000 tDUST
  }
}

export const midnightWalletAdapter = new MidnightWalletAdapter();
