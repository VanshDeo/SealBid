import {
  CircuitCallParams,
  CircuitExecutionResult,
  IWalletProvider,
  IProofProvider,
  IPublicDataProvider,
  IPrivateStateProvider,
  MidnightProviderBundle,
} from "../types/midnight-sdk";

/**
 * Reusable Service for executing Compact contract circuits with Zero-Knowledge proofs.
 * Uses Dependency Injection for provider access.
 */
export class CircuitExecutionService {
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
   * Executes a Compact contract circuit call, generating a ZK proof and submitting on-chain.
   */
  public async callCircuit<TOutput = unknown>(
    params: CircuitCallParams
  ): Promise<CircuitExecutionResult<TOutput>> {
    console.log(
      `[CircuitExecutionService] Calling circuit '${params.circuitName}' on contract '${params.contractAddress}'`
    );

    // 1. Verify wallet connection
    const account = await this.walletProvider.getAccount();
    if (!account) {
      throw new Error("[CircuitExecutionService] Wallet connection required to execute circuit.");
    }

    // 2. Fetch or merge private witness data
    let witness = params.privateWitness || {};
    if (Object.keys(witness).length === 0) {
      const savedWitness = await this.privateStateProvider.getPrivateState<Record<string, unknown>>(
        `witness_${params.contractAddress}_${params.circuitName}`
      );
      if (savedWitness) {
        witness = savedWitness;
      }
    }

    // 3. Generate ZK Proof using Proof Provider
    console.log(`[CircuitExecutionService] Generating ZK proof for ${params.circuitName}...`);
    const proofResult = await this.proofProvider.generateProof({
      circuitName: params.circuitName,
      publicInputs: params.publicInputs,
      privateWitness: witness,
      contractAddress: params.contractAddress,
    });

    // 4. Construct transaction payload
    const txPayload = {
      contractAddress: params.contractAddress,
      circuitName: params.circuitName,
      publicInputs: params.publicInputs,
      proof: proofResult.proofBytes,
      proofId: proofResult.proofId,
      caller: account.address,
      timestamp: Date.now(),
    };

    // 5. Submit transaction via Wallet Provider
    console.log(`[CircuitExecutionService] Submitting circuit execution tx...`);
    const { txHash } = await this.walletProvider.submitTx(txPayload);

    // 6. Monitor transaction confirmation via Public Data Provider
    const txStatus = await this.publicDataProvider.getTransactionStatus(txHash);

    // 7. Save witness to private state if requested
    if (params.saveWitnessToPrivateState && params.privateWitness) {
      await this.privateStateProvider.setPrivateState(
        `witness_${params.contractAddress}_${params.circuitName}`,
        params.privateWitness
      );
    }

    console.log(
      `[CircuitExecutionService] Circuit execution completed successfully. Tx Hash: ${txHash}`
    );

    return {
      txHash,
      proof: proofResult,
      publicOutputs: proofResult.publicOutputs as TOutput,
      blockHeight: txStatus.blockHeight,
      confirmed: txStatus.confirmed,
    };
  }
}
