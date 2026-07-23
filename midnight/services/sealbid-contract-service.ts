import { BaseCompactContractService } from "./base-compact-contract-service";
import { MidnightProviderBundle, CircuitExecutionResult } from "../types/midnight-sdk";

export interface SealBidState {
  auction_id: string;
  seller_pk: string;
  reserve_price: bigint;
  bidding_deadline: bigint;
  reveal_deadline: bigint;
  highest_commitment: string;
  is_settled: boolean;
}

export type SealBidCircuits = {
  submit_sealed_bid: {
    publicInputs: { auction_id: string; commitment: string };
    output: boolean;
  };
  reveal_bid: {
    publicInputs: { auction_id: string; revealed_amount: bigint; salt: string };
    output: boolean;
  };
  settle_auction: {
    publicInputs: { auction_id: string };
    output: boolean;
  };
};

/**
 * Concrete Contract Service for SealBid Compact ZK Smart Contract.
 * Inherits infrastructure from BaseCompactContractService.
 */
export class SealBidContractService extends BaseCompactContractService<
  SealBidState,
  SealBidCircuits
> {
  constructor(providers: MidnightProviderBundle, contractAddress?: string) {
    super("SealBidContract", providers, contractAddress);
  }

  /**
   * Submits a zero-knowledge sealed bid to the auction contract.
   */
  public async submitSealedBid(
    auctionId: string,
    bidAmount: bigint,
    salt: string
  ): Promise<CircuitExecutionResult<boolean>> {
    // Generate deterministic commitment hash for public input
    const commitment = `0xcommit_${Buffer.from(`${bidAmount}:${salt}`).toString("hex").slice(0, 32)}`;

    // Private witness input (kept confidential in client storage / prover witness)
    const privateWitness = {
      bid_amount: bidAmount.toString(),
      salt,
      timestamp: Date.now(),
    };

    return await this.executeCircuit(
      "submit_sealed_bid",
      {
        auction_id: auctionId,
        commitment,
      },
      privateWitness,
      true
    );
  }

  /**
   * Reveals a previously committed sealed bid during reveal window.
   */
  public async revealBid(
    auctionId: string,
    revealedAmount: bigint,
    salt: string
  ): Promise<CircuitExecutionResult<boolean>> {
    const privateWitness = {
      bid_amount: revealedAmount.toString(),
      salt,
    };

    return await this.executeCircuit(
      "reveal_bid",
      {
        auction_id: auctionId,
        revealed_amount: revealedAmount,
        salt,
      },
      privateWitness,
      false
    );
  }

  /**
   * Settles the auction and declares the winning bid.
   */
  public async settleAuction(auctionId: string): Promise<CircuitExecutionResult<boolean>> {
    return await this.executeCircuit("settle_auction", { auction_id: auctionId });
  }

  /**
   * Gets public auction ledger state.
   */
  public async getAuctionState(): Promise<SealBidState | null> {
    return await this.getState();
  }
}
