"use server";

import { Auction } from "@/lib/types";

// Mock auction dataset for architecture showcase
const MOCK_AUCTIONS: Auction[] = [
  {
    id: "auc_01",
    title: "Midnight Genesis Privacy Key #001",
    description:
      "Rare zero-knowledge cryptographic key granting tier-1 access to Midnight privacy features.",
    assetName: "Genesis Key #001",
    assetImageUrl: "/placeholder-nft.png",
    sellerAddress: "mn_test1qqseller001x79093eamxvgspg8p3pwn5q963g6v",
    contractAddress: "0xsealbid_contract_address_01",
    reservePrice: 5_000_000_000n, // 5,000 tDUST
    status: "ACTIVE",
    biddingEndTime: new Date(Date.now() + 86400 * 2 * 1000).toISOString(), // 2 days
    revealEndTime: new Date(Date.now() + 86400 * 3 * 1000).toISOString(), // 3 days
    totalSealedBids: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: "auc_02",
    title: "Confidential Real-Estate Token (Estate #42)",
    description:
      "Fractional ownership in high-yield commercial real estate with privacy-preserving yield distribution.",
    assetName: "Estate Token #42",
    assetImageUrl: "/placeholder-estate.png",
    sellerAddress: "mn_test1qqseller002x79093eamxvgspg8p3pwn5q963g6v",
    contractAddress: "0xsealbid_contract_address_02",
    reservePrice: 25_000_000_000n, // 25,000 tDUST
    status: "ACTIVE",
    biddingEndTime: new Date(Date.now() + 3600 * 5 * 1000).toISOString(), // 5 hours
    revealEndTime: new Date(Date.now() + 86400 * 1 * 1000).toISOString(), // 1 day
    totalSealedBids: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: "auc_03",
    title: "ZK Sovereign Domain Name (zk.midnight)",
    description:
      "Decentralized top-level identity domain registered natively on the Midnight network.",
    assetName: "zk.midnight",
    sellerAddress: "mn_test1qqseller003x79093eamxvgspg8p3pwn5q963g6v",
    contractAddress: "0xsealbid_contract_address_03",
    reservePrice: 1_200_000_000n, // 1,200 tDUST
    status: "REVEALING",
    biddingEndTime: new Date(Date.now() - 3600 * 2 * 1000).toISOString(), // Ended 2h ago
    revealEndTime: new Date(Date.now() + 86400 * 1 * 1000).toISOString(),
    totalSealedBids: 42,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Server Action stub for fetching active and upcoming auctions.
 */
export async function getAuctionsAction(): Promise<Auction[]> {
  // Simulate network fetch latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_AUCTIONS;
}

/**
 * Server Action stub for fetching auction details by ID.
 */
export async function getAuctionByIdAction(id: string): Promise<Auction | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_AUCTIONS.find((a) => a.id === id) || null;
}
