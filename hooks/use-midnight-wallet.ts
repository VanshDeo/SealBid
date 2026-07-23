"use client";

import { useMidnight } from "@/providers/midnight-provider";

export function useMidnightWallet() {
  const { wallet, connectWallet, disconnectWallet, isNetworkReady } = useMidnight();

  return {
    ...wallet,
    connect: connectWallet,
    disconnect: disconnectWallet,
    isNetworkReady,
  };
}
