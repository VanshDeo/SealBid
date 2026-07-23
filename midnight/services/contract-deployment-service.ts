import type {
  ContractDeploymentParams,
  DeploymentResult,
  IWalletProvider,
  IProofProvider,
  IPublicDataProvider,
  IPrivateStateProvider,
  MidnightProviderBundle,
} from "../types/midnight-sdk";

/**
 * Reusable Service for deploying Compact ZK smart contracts.
 * Uses Dependency Injection to access providers.
 */
export class ContractDeploymentService {
  private walletProvider: IWalletProvider;
  private proofProvider: IProofProvider;
  private publicDataProvider: IPublicDataProvider;
  private privateStateProvider: IPrivateStateProvider;

  constructor(providers: MidnightProviderBundle) {
    this.walletProvider = providers.wallet;
    this.proofProvider = providers.proof;
    this.publicDataProvider = providers.publicData;
    this.privateStateProvider = providers.privateState;
  }

  /**
   * Deploys a compiled Compact smart contract to the Midnight network.
   */
  public async deployContract(params: ContractDeploymentParams): Promise<DeploymentResult> {
    console.log(
      `[ContractDeploymentService] Initiating deployment for contract: ${params.contractName}`
    );

    // 1. Ensure wallet is connected
    const account = await this.walletProvider.getAccount();
    if (!account) {
      throw new Error(
        "[ContractDeploymentService] Wallet connection required before deploying contract."
      );
    }

    // 2. Generate initial state deployment proof
    console.log("[ContractDeploymentService] Generating initial state ZK proof...");
    const initProof = await this.proofProvider.generateProof({
      circuitName: `${params.contractName}_constructor`,
      publicInputs: params.initialState,
      privateWitness: params.privateWitness || {},
    });

    // 3. Build contract deployment payload
    const deploymentPayload = {
      contractName: params.contractName,
      bytecode: params.compiledBytecode,
      initialState: params.initialState,
      constructorArgs: params.constructorArgs || {},
      initProof: initProof.proofBytes,
      deployer: account.address,
    };

    // 4. Submit deployment transaction via wallet
    console.log("[ContractDeploymentService] Submitting deployment transaction via wallet...");
    const { txHash } = await this.walletProvider.submitTx(deploymentPayload);

    // 5. Derive deterministic / returned contract address
    const contractAddress = `0xcontract_${params.contractName.toLowerCase()}_${txHash.slice(4, 18)}`;
    const currentBlock = await this.publicDataProvider.getBlockHeight();

    // 6. Save private state witness if present
    if (params.privateWitness) {
      await this.privateStateProvider.setPrivateState(
        `contract_init_witness_${contractAddress}`,
        params.privateWitness
      );
    }

    console.log(
      `[ContractDeploymentService] Contract successfully deployed at: ${contractAddress}`
    );

    return {
      contractAddress,
      txHash,
      blockHeight: currentBlock,
      deployedAt: new Date(),
    };
  }
}
