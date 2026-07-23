import { AUCTION_STATUS, PROOF_STATUS } from "./constants";

export type AuctionStatus = keyof typeof AUCTION_STATUS;
export type ProofStatus = keyof typeof PROOF_STATUS;

export interface Auction {
  id: string;
  title: string;
  description: string;
  assetName: string;
  assetImageUrl?: string;
  sellerAddress: string;
  contractAddress: string;
  reservePrice: bigint;
  status: AuctionStatus;
  biddingEndTime: string; // ISO String
  revealEndTime: string; // ISO String
  totalSealedBids: number;
  highestBid?: bigint;
  winningBidder?: string;
  createdAt: string;
}

export interface SealedBid {
  id: string;
  auctionId: string;
  bidderAddress: string;
  commitmentHash: string; // ZK commitment hash stored on ledger
  encryptedAmount: string; // Encrypted bid amount stored in client storage
  salt: string;
  proofStatus: ProofStatus;
  submittedAt: string;
  revealed: boolean;
  revealedAmount?: bigint;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  coinPublicKey: string | null;
  balance: bigint;
  networkId: string;
  error: string | null;
}

export interface ProofGenerationState {
  status: ProofStatus;
  progress: number; // 0 to 100
  message: string;
  proofData: string | null;
  error: string | null;
}
