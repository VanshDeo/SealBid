import { env } from "@/config/env";
import { MidnightClientOptions, MidnightNetworkConfig } from "./types";

export class MidnightClient {
  private networkConfig: MidnightNetworkConfig;
  private isInitialized = false;

  constructor(options?: Partial<MidnightClientOptions>) {
    this.networkConfig = {
      networkId: options?.network?.networkId || env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID,
      indexerUrl: options?.network?.indexerUrl || env.NEXT_PUBLIC_MIDNIGHT_INDEXER_URL,
      nodeUrl: options?.network?.nodeUrl || env.NEXT_PUBLIC_MIDNIGHT_NODE_URL,
      proofServerUrl: options?.network?.proofServerUrl || env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL,
    };
  }

  /**
   * Initializes Midnight RPC Node and Indexer clients.
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Midnight SDK node & indexer connection stub
      console.log(
        `[MidnightClient] Initializing connection to network: ${this.networkConfig.networkId}`
      );
      console.log(`[MidnightClient] Node URL: ${this.networkConfig.nodeUrl}`);
      console.log(`[MidnightClient] Indexer URL: ${this.networkConfig.indexerUrl}`);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("[MidnightClient] Failed to initialize connection:", error);
      return false;
    }
  }

  public getNetworkConfig(): MidnightNetworkConfig {
    return { ...this.networkConfig };
  }

  public isConnected(): boolean {
    return this.isInitialized;
  }
}

// Singleton client instance export
export const midnightClient = new MidnightClient();
