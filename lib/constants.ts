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
  PUBLIC_PROFILES: "sealbid_public_profiles_v1",
  ENCRYPTED_USER_INFO: "sealbid_encrypted_user_info_v1",
  AUTH_SESSION: "sealbid_auth_session_v1",
  ENCRYPTED_VENDOR_PROFILE: "sealbid_encrypted_vendor_profile_v1",
  PROCUREMENT_RFPS: "sealbid_procurement_rfps_v1",
} as const;

export const VENDOR_CERTIFICATION_TYPES = [
  "ISO 9001: Quality Management",
  "ISO 14001: Environmental Management",
  "ISO 27001: Information Security",
  "ISO 45001: Occupational Health & Safety",
  "IATF 16949: Automotive Quality",
  "AS9100: Aerospace Quality",
  "CE Marking Compliance",
  "GMP: Good Manufacturing Practice",
] as const;

export const BIDDING_STAGES = [
  { id: "SINGLE_STAGE_SEALED", label: "Single-Stage Sealed Bid", description: "Direct one-shot sealed financial bid submission" },
  { id: "TWO_STAGE_QUALIFICATION", label: "Two-Stage Qualification + Pricing", description: "Stage 1 ZK Qualification, Stage 2 Sealed Price Bidding" },
  { id: "DYNAMIC_AUCTION", label: "Dynamic Sealed-Bid Auction", description: "Multi-round confidential competitive tender" },
] as const;
