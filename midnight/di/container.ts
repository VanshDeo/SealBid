import {
  IWalletProvider,
  IProofProvider,
  IPublicDataProvider,
  IPrivateStateProvider,
  MidnightProviderBundle,
} from "../types/midnight-sdk";
import { MidnightWalletProvider } from "../providers/wallet-provider";
import { MidnightProofProvider } from "../providers/proof-provider";
import { MidnightPublicDataProvider } from "../providers/public-data-provider";
import { MidnightPrivateStateProvider } from "../providers/private-state-provider";
import { ContractDeploymentService } from "../services/contract-deployment-service";
import { CircuitExecutionService } from "../services/circuit-execution-service";
import { StateQueryService } from "../services/state-query-service";
import { SealBidContractService } from "../services/sealbid-contract-service";
import { env } from "@/config/env";

export interface MidnightServicesContainerConfig {
  walletProvider?: IWalletProvider;
  proofProvider?: IProofProvider;
  publicDataProvider?: IPublicDataProvider;
  privateStateProvider?: IPrivateStateProvider;
}

/**
 * Dependency Injection Container for Midnight SDK Services and Providers.
 * Ensures clean separation of concerns and provider pluggability.
 */
export class MidnightServicesContainer {
  public wallet: IWalletProvider;
  public proof: IProofProvider;
  public publicData: IPublicDataProvider;
  public privateState: IPrivateStateProvider;

  // Resolved Service Singletons
  public deploymentService: ContractDeploymentService;
  public circuitService: CircuitExecutionService;
  public stateQueryService: StateQueryService;

  constructor(config?: MidnightServicesContainerConfig) {
    this.wallet = config?.walletProvider || new MidnightWalletProvider();
    this.proof =
      config?.proofProvider || new MidnightProofProvider(env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL);
    this.publicData =
      config?.publicDataProvider ||
      new MidnightPublicDataProvider(
        env.NEXT_PUBLIC_MIDNIGHT_NODE_URL,
        env.NEXT_PUBLIC_MIDNIGHT_INDEXER_URL
      );
    this.privateState = config?.privateStateProvider || new MidnightPrivateStateProvider();

    const bundle = this.getProvidersBundle();

    this.deploymentService = new ContractDeploymentService(bundle);
    this.circuitService = new CircuitExecutionService(bundle);
    this.stateQueryService = new StateQueryService(bundle);
  }

  /**
   * Returns a snapshot of registered providers.
   */
  public getProvidersBundle(): MidnightProviderBundle {
    return {
      wallet: this.wallet,
      proof: this.proof,
      publicData: this.publicData,
      privateState: this.privateState,
    };
  }

  /**
   * Creates a SealBidContractService instance using injected providers.
   */
  public createSealBidContractService(contractAddress?: string): SealBidContractService {
    const addr = contractAddress || env.NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS;
    return new SealBidContractService(this.getProvidersBundle(), addr);
  }
}

/**
 * Helper factory to initialize container.
 */
export function createDefaultContainer(
  config?: MidnightServicesContainerConfig
): MidnightServicesContainer {
  return new MidnightServicesContainer(config);
}
