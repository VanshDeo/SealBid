/**
 * Data structures for Midnight ZK-SDK integration layer.
 */

export interface MidnightNetworkConfig {
  networkId: string;
  indexerUrl: string;
  nodeUrl: string;
  proofServerUrl: string;
}

export interface MidnightClientOptions {
  network: MidnightNetworkConfig;
  autoConnect?: boolean;
}

export interface ZkProofParams {
  circuitName: string;
  publicInputs: Record<string, unknown>;
  privateWitness: Record<string, unknown>;
}

export interface ZkProofResult {
  proofId: string;
  proofBytes: string;
  publicOutputs: Record<string, unknown>;
  generationTimeMs: number;
}

export interface MidnightWalletConnector {
  name: string;
  icon: string;
  apiVersion: string;
  connect(): Promise<{ address: string; coinPublicKey: string }>;
  disconnect(): Promise<void>;
  signTransaction(txBytes: Uint8Array): Promise<Uint8Array>;
  getBalance(): Promise<bigint>;
}
