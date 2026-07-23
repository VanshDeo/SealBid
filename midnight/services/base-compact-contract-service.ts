import {
  CircuitCallParams,
  CircuitExecutionResult,
  ContractDeploymentParams,
  DeploymentResult,
  MidnightProviderBundle,
} from "../types/midnight-sdk";
import { ContractDeploymentService } from "./contract-deployment-service";
import { CircuitExecutionService } from "./circuit-execution-service";
import { StateQueryService } from "./state-query-service";

/**
 * Generic Base Class for Compact ZK Smart Contracts.
 * Serves as reusable foundation for all present and future Compact contracts.
 *
 * @template TState Shape of the contract's public ledger state.
 * @template TCircuits Map of available circuit names to their input/output shapes.
 */
export abstract class BaseCompactContractService<
  TState = Record<string, unknown>,
  TCircuits extends Record<string, { publicInputs: Record<string, unknown>; output: unknown }> =
    Record<string, { publicInputs: Record<string, unknown>; output: unknown }>,
> {
  protected deploymentService: ContractDeploymentService;
  protected circuitService: CircuitExecutionService;
  protected queryService: StateQueryService;
  public contractAddress: string | null = null;
  public contractName: string;

  constructor(contractName: string, providers: MidnightProviderBundle, contractAddress?: string) {
    this.contractName = contractName;
    this.contractAddress = contractAddress || null;
    this.deploymentService = new ContractDeploymentService(providers);
    this.circuitService = new CircuitExecutionService(providers);
    this.queryService = new StateQueryService(providers);
  }

  /**
   * Deploys this Compact contract instance.
   */
  public async deploy(
    compiledBytecode: string,
    initialState: Record<string, unknown>,
    constructorArgs?: Record<string, unknown>,
    privateWitness?: Record<string, unknown>
  ): Promise<DeploymentResult> {
    const params: ContractDeploymentParams = {
      contractName: this.contractName,
      compiledBytecode,
      initialState,
      constructorArgs,
      privateWitness,
    };

    const result = await this.deploymentService.deployContract(params);
    this.contractAddress = result.contractAddress;
    return result;
  }

  /**
   * Executes a circuit on this contract instance.
   */
  public async executeCircuit<K extends keyof TCircuits & string>(
    circuitName: K,
    publicInputs: TCircuits[K]["publicInputs"],
    privateWitness?: Record<string, unknown>,
    saveWitnessToPrivateState = true
  ): Promise<CircuitExecutionResult<TCircuits[K]["output"]>> {
    if (!this.contractAddress) {
      throw new Error(`[${this.contractName}] Contract is not deployed or address is unset.`);
    }

    const params: CircuitCallParams = {
      contractAddress: this.contractAddress,
      circuitName,
      publicInputs,
      privateWitness,
      saveWitnessToPrivateState,
    };

    return await this.circuitService.callCircuit<TCircuits[K]["output"]>(params);
  }

  /**
   * Reads public ledger state for this contract.
   */
  public async getState(): Promise<TState | null> {
    if (!this.contractAddress) {
      throw new Error(`[${this.contractName}] Contract address is unset.`);
    }
    return await this.queryService.getPublicState<TState>(this.contractAddress);
  }

  /**
   * Reads client-side encrypted private state for a given key.
   */
  public async getPrivateState<T>(key: string): Promise<T | null> {
    return await this.queryService.getPrivateState<T>(key);
  }
}
