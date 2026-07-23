import {
  ContractEvent,
  EventFilter,
  IPublicDataProvider,
  IPrivateStateProvider,
  MidnightProviderBundle,
} from "../types/midnight-sdk";

/**
 * Reusable Service for querying public contract ledger state and local private state.
 * Uses Dependency Injection for provider access.
 */
export class StateQueryService {
  private publicDataProvider: IPublicDataProvider;
  private privateStateProvider: IPrivateStateProvider;

  constructor(providers: MidnightProviderBundle) {
    this.publicDataProvider = providers.publicData;
    this.privateStateProvider = providers.privateState;
  }

  /**
   * Reads public ledger state for a deployed contract address.
   */
  public async getPublicState<T = Record<string, unknown>>(
    contractAddress: string
  ): Promise<T | null> {
    return await this.publicDataProvider.getContractState<T>(contractAddress);
  }

  /**
   * Reads private state entry stored in encrypted client storage.
   */
  public async getPrivateState<T>(key: string): Promise<T | null> {
    return await this.privateStateProvider.getPrivateState<T>(key);
  }

  /**
   * Queries indexer for contract events matching filter parameters.
   */
  public async queryEvents(filter: EventFilter): Promise<ContractEvent[]> {
    return await this.publicDataProvider.queryEvents(filter);
  }

  /**
   * Fetches current block height of the network.
   */
  public async getBlockHeight(): Promise<number> {
    return await this.publicDataProvider.getBlockHeight();
  }
}
