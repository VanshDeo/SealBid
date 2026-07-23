import Link from "next/link";
import { getAuctionsAction } from "@/actions/auction-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuctionCard } from "@/components/auction/auction-card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const auctions = await getAuctionsAction();
  const activeAuctions = auctions.filter((a) => a.status === "ACTIVE");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">DApp Overview</h1>
          <p className="text-sm text-gray-400">
            Monitor confidential auction protocol metrics & active bids
          </p>
        </div>
        <Link href="/auctions">
          <Button variant="primary">Explore All Auctions</Button>
        </Link>
      </div>

      {/* Protocol Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400">Active Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeAuctions.length}</div>
            <p className="mt-1 font-mono text-xs text-emerald-400">Live on Midnight Testnet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400">Total Sealed Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {auctions.reduce((acc, curr) => acc + curr.totalSealedBids, 0)}
            </div>
            <p className="mt-1 font-mono text-xs text-indigo-400">ZK Commitments Verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400">
              Midnight Node Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-emerald-400">
              <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
              Online
            </div>
            <p className="mt-1 font-mono text-xs text-gray-500">undeployed-testnet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400">ZK Prover Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-cyan-400">WASM / Local</div>
            <p className="mt-1 font-mono text-xs text-gray-500">Proof Timeout: 45s</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Auctions Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Active Sealed-Bid Auctions</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {activeAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
    </div>
  );
}
