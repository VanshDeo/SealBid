"use client";

import React, { useState } from "react";
import { useSealedBid } from "@/hooks/use-sealed-bid";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProofStatusBadge } from "@/components/midnight/proof-status-badge";

export interface SealedBidFormProps {
  auctionId: string;
  reservePrice: bigint;
  onSuccess?: () => void;
}

export function SealedBidForm({ auctionId, reservePrice, onSuccess }: SealedBidFormProps) {
  const { isConnected } = useMidnightWallet();
  const { submitBid, provingState } = useSealedBid();
  const [bidAmountInput, setBidAmountInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const parsedAmount = parseFloat(bidAmountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid positive bid amount.");
      return;
    }

    const bidAmountBigInt = BigInt(Math.floor(parsedAmount * 1_000_000));
    if (bidAmountBigInt < reservePrice) {
      setErrorMessage(`Bid must meet or exceed reserve price of ${formatCurrency(reservePrice)}.`);
      return;
    }

    const res = await submitBid(auctionId, bidAmountBigInt);
    if (res.success) {
      setBidAmountInput("");
      if (onSuccess) onSuccess();
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const isProving =
    provingState.status === "GENERATING_WITNESS" || provingState.status === "PROVING";

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Zero-Knowledge Guarantee:</span>
          <ProofStatusBadge status={provingState.status} />
        </div>
        <p className="text-xs text-gray-300">
          Your bid amount is encrypted locally using AES-GCM and proven via Midnight ZK circuits.
          Only a cryptographic commitment hash is published on-chain.
        </p>
      </div>

      <Input
        label="Sealed Bid Amount (tDUST)"
        type="number"
        step="0.000001"
        placeholder={`Min reserve: ${formatCurrency(reservePrice)}`}
        value={bidAmountInput}
        onChange={(e) => setBidAmountInput(e.target.value)}
        error={errorMessage}
        disabled={!isConnected || isProving}
      />

      {isProving && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-indigo-300">
            <span>{provingState.message}</span>
            <span>{provingState.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${provingState.progress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isProving}
        disabled={!isConnected}
      >
        {!isConnected
          ? "Connect Wallet to Bid"
          : isProving
            ? "Generating ZK Proof..."
            : "Generate ZK Proof & Submit Sealed Bid"}
      </Button>
    </form>
  );
}
