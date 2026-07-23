export const APP_NAME = "SealBid";
export const APP_DESCRIPTION = "Confidential Zero-Knowledge Auction Protocol on Midnight";

export const MIDNIGHT_CONFIG = {
  DEFAULT_NETWORK_ID: process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID || "preview",
  CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS ||
    "0xcontract_sealbid_preview_7f3a9b1c2e4d5f",
  TOKEN_SYMBOL: "tDUST",
  DECIMALS: 6,
  PROOF_TIMEOUT_MS: 45_000,
} as const;

export const AUCTION_STATUS = {
  UPCOMING: "UPCOMING",
  ACTIVE: "ACTIVE",
  REVEALING: "REVEALING",
  SETTLED: "SETTLED",
  CANCELLED: "CANCELLED",
} as const;

export const PROOF_STATUS = {
  IDLE: "IDLE",
  GENERATING_WITNESS: "GENERATING_WITNESS",
  PROVING: "PROVING",
  VERIFIED: "VERIFIED",
  SUBMITTED: "SUBMITTED",
  FAILED: "FAILED",
} as const;

export const STORAGE_KEYS = {
  ENCRYPTED_BIDS: "sealbid_encrypted_bids_v1",
  USER_KEYS: "sealbid_user_keys_v1",
  SESSION_CACHE: "sealbid_session_cache",
} as const;
