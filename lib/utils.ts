import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with tailwind-merge to prevent utility conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Midnight / Cardano wallet address for display.
 * e.g., 0x1234567890abcdef... -> 0x1234...cdef
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats currency values for bid amounts (TDU / DUST).
 */
export function formatCurrency(amount: bigint | number, symbol = "tDUST"): string {
  const num = typeof amount === "bigint" ? Number(amount) / 1_000_000 : amount;
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${symbol}`;
}

/**
 * Formats seconds into a human-readable countdown string.
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Auction Ended";
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m ${secs}s remaining`;
}

/**
 * Generates a dummy ZK commitment hash stub for sealed bid demonstration.
 */
export function generateCommitmentHash(bidAmount: bigint, nonce: string): string {
  return `0xzk_${Buffer.from(`${bidAmount}_${nonce}`).toString("hex").slice(0, 32)}`;
}
