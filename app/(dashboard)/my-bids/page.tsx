"use client";

import { useEncryptedStorage } from "@/hooks/use-encrypted-storage";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProofStatusBadge } from "@/components/midnight/proof-status-badge";
import { Button } from "@/components/ui/button";

export default function MyBidsPage() {
  const { bids, loading, refresh } = useEncryptedStorage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Encrypted Bids</h1>
          <p className="text-sm text-gray-400">
            Decrypted client-side from Web Crypto local storage using AES-GCM 256-bit encryption
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh Bids
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-400">
            Decrypting local storage records...
          </CardContent>
        </Card>
      ) : bids.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-2xl text-indigo-400">
              🔒
            </div>
            <h3 className="text-lg font-semibold text-white">No Sealed Bids Found</h3>
            <p className="mx-auto max-w-md text-sm text-gray-400">
              You haven&apos;t submitted any zero-knowledge sealed bids yet. Browse active auctions
              to participate confidentially.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Auction #{bid.auctionId}</CardTitle>
                <ProofStatusBadge status={bid.proofStatus} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950/60 p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Decrypted Bid Amount:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {formatCurrency(BigInt(bid.encryptedAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Commitment Hash:</span>
                    <span className="font-mono text-cyan-300">
                      {formatAddress(bid.commitmentHash, 10, 6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Salt:</span>
                    <span className="font-mono text-gray-400">{formatAddress(bid.salt, 8, 4)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Bid ID: {bid.id}</span>
                  <span>Submitted: {new Date(bid.submittedAt).toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
