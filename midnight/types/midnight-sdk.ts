/**
 * Core type definitions & provider interfaces for Midnight SDK integration.
 */

export type NetworkId = "undeployed-testnet" | "devnet" | "testnet" | "mainnet" | string;

export interface DAppConnectorWalletAPI {
  enable?: () => Promise<DAppConnectorWalletAPI>;
  isEnabled?: () => Promise<boolean>;
  state?: () => Promise<{
    address?: string;
    coinPublicKey?: string;
    encryptionPublicKey?: string;
    balances?: Array<{ coinType: string; amount: bigint }>;
    networkId?: NetworkId;
  }>;
  getNetworkId?: () => Promise<NetworkId>;
  networkId?: () => Promise<NetworkId>;
  submitTx?: (txData: unknown) => Promise<{ txHash: string }>;
  getBalancingProof?: (txData: unknown) => Promise<unknown | null>;
  serializeState?: (stateData: unknown) => string | null;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<DAppConnectorWalletAPI>;
        isEnabled: () => Promise<boolean>;
        name?: string;
        apiVersion?: string;
        icon?: string;
      };
    };
  }
}

export interface WalletAccountState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey?: string;
  balance: bigint;
  networkId: NetworkId;
}

export interface ZkProofParams {
  circuitName: string;
  publicInputs: Record<string, unknown>;
  privateWitness: Record<string, unknown>;
  contractAddress?: string;
}

export interface ZkProofResult {
  proofId: string;
  proofBytes: string;
  publicOutputs: Record<string, unknown>;
  generationTimeMs: number;
}

export interface ContractDeploymentParams {
  contractName: string;
  compiledBytecode: string;
  initialState: Record<string, unknown>;
  constructorArgs?: Record<string, unknown>;
  privateWitness?: Record<string, unknown>;
}

export interface DeploymentResult {
  contractAddress: string;
  txHash: string;
  blockHeight: number;
  deployedAt: Date;
}

export interface CircuitCallParams {
  contractAddress: string;
  circuitName: string;
  publicInputs: Record<string, unknown>;
  privateWitness?: Record<string, unknown>;
  saveWitnessToPrivateState?: boolean;
}

export interface CircuitExecutionResult<TOutput = unknown> {
  txHash: string;
  proof: ZkProofResult;
  publicOutputs: TOutput;
  blockHeight: number;
  confirmed: boolean;
}

export interface ContractEvent {
  id: string;
  contractAddress: string;
  eventName: string;
  payload: Record<string, unknown>;
  blockHeight: number;
  timestamp: Date;
}

export interface EventFilter {
  contractAddress?: string;
  eventName?: string;
  fromBlock?: number;
  toBlock?: number;
}

/**
 * ------------------------------------------------------------------
 * PROVIDER INTERFACES (Dependency Injection Abstractions)
 * ------------------------------------------------------------------
 */

/**
 * Interface for Midnight Wallet Provider.
 */
export interface IWalletProvider {
  name: string;
  isConnected(): boolean;
  connect(): Promise<WalletAccountState>;
  disconnect(): Promise<void>;
  getAccount(): Promise<WalletAccountState | null>;
  signTransaction(txBytes: Uint8Array): Promise<Uint8Array>;
  submitTx(txData: unknown): Promise<{ txHash: string }>;
  getBalancingProof(txData: unknown): Promise<unknown | null>;
}

/**
 * Interface for Midnight ZK Proof Generation Provider.
 */
export interface IProofProvider {
  serverUrl: string;
  generateProof(params: ZkProofParams): Promise<ZkProofResult>;
  verifyProof(proofBytes: string, publicInputs: Record<string, unknown>): Promise<boolean>;
  getProvingKeyStatus(circuitName: string): Promise<boolean>;
}

/**
 * Interface for Midnight Public Data Query Provider (RPC Node & Indexer).
 */
export interface IPublicDataProvider {
  nodeUrl: string;
  indexerUrl: string;
  getContractState<T = Record<string, unknown>>(contractAddress: string): Promise<T | null>;
  getBlockHeight(): Promise<number>;
  queryEvents(filter: EventFilter): Promise<ContractEvent[]>;
  getTransactionStatus(txHash: string): Promise<{ confirmed: boolean; blockHeight: number }>;
}

/**
 * Interface for Midnight Private State Provider (Client-Side Encrypted Storage).
 */
export interface IPrivateStateProvider {
  getPrivateState<T>(key: string): Promise<T | null>;
  setPrivateState<T>(key: string, value: T): Promise<void>;
  removePrivateState(key: string): Promise<void>;
  clearPrivateState(): Promise<void>;
}

/**
 * Bundle of all Midnight Providers for Dependency Injection.
 */
export interface MidnightProviderBundle {
  wallet: IWalletProvider;
  proof: IProofProvider;
  publicData: IPublicDataProvider;
  privateState: IPrivateStateProvider;
}
