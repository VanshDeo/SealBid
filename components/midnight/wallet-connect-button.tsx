"use client";

import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WalletConnectButton() {
  const { isConnected, isConnecting, address, balance, connect, disconnect } = useMidnightWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="hidden flex-col items-end rounded-xl border border-gray-800 bg-gray-900/80 px-3 py-1 text-xs sm:flex">
          <span className="font-mono text-gray-400">{formatCurrency(balance)}</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Midnight Testnet
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect} className="font-mono text-xs">
          {formatAddress(address)}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      isLoading={isConnecting}
      onClick={connect}
      className="gap-2"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      Connect Midnight Wallet
    </Button>
  );
}
