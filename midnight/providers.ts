import { MidnightWalletProvider } from "./providers/wallet-provider";

/**
 * Midnight DApp Wallet Provider Adapter (Lace / Midnight Wallet Extension).
 * Delegates connection requests directly to injected window.midnight.mnLace / lace connectors.
 */
export class MidnightWalletAdapter {
  public name = "Midnight Lace Wallet";
  public icon = "/midnight-logo.svg";
  public apiVersion = "1.0.0";
  private provider = new MidnightWalletProvider();

  public async connect(): Promise<{
    address: string;
    coinPublicKey: string;
    balance: bigint;
    networkId: string;
  }> {
    console.log(
      "[MidnightWalletAdapter] Opening Midnight Lace Wallet Extension Connection Prompt..."
    );
    const account = await this.provider.connect();
    return {
      address: account.address,
      coinPublicKey: account.coinPublicKey,
      balance: account.balance,
      networkId: account.networkId,
    };
  }

  public async disconnect(): Promise<void> {
    console.log("[MidnightWalletAdapter] Disconnecting Midnight Lace Wallet.");
    await this.provider.disconnect();
  }

  public async signTransaction(txBytes: Uint8Array): Promise<Uint8Array> {
    return await this.provider.signTransaction(txBytes);
  }

  public async getBalance(): Promise<bigint> {
    const acc = await this.provider.getAccount();
    return acc ? acc.balance : 0n;
  }
}

export const midnightWalletAdapter = new MidnightWalletAdapter();
