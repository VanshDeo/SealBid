/**
 * TypeScript interface bindings for Compact smart contract outputs & witness types.
 */

export interface CompactLedgerState {
  auctionId: string;
  sellerPublicKey: string;
  reservePrice: bigint;
  biddingDeadline: bigint;
  revealDeadline: bigint;
  highestCommitment: string;
  isSettled: boolean;
}

export interface CompactPrivateWitness {
  bidAmount: bigint;
  salt: string;
  bidderSecretKey: string;
}

export interface CompactCircuitResult {
  success: boolean;
  commitmentHash: string;
  proofData: Uint8Array;
  nullifier?: string;
}

export interface CompactContractInterface {
  submitSealedBid(
    auctionId: string,
    commitment: string,
    witness: CompactPrivateWitness
  ): Promise<CompactCircuitResult>;

  revealBid(auctionId: string, revealedAmount: bigint, salt: string): Promise<CompactCircuitResult>;

  settleAuction(auctionId: string): Promise<CompactCircuitResult>;
}
