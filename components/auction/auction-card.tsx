import Link from "next/link";
import { Auction } from "@/lib/types";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const isBiddingActive = auction.status === "ACTIVE";

  return (
    <Card interactive className="flex h-full flex-col justify-between">
      <div>
        <CardHeader>
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge variant={isBiddingActive ? "active" : "revealing"}>{auction.status}</Badge>
            <span className="rounded-full border border-cyan-800/40 bg-cyan-950/40 px-2 py-0.5 font-mono text-xs text-cyan-400">
              ZK Sealed Bid
            </span>
          </div>
          <CardTitle>{auction.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="line-clamp-2 text-sm text-gray-400">{auction.description}</p>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-800/60 bg-gray-950/60 p-3 text-xs">
            <div>
              <span className="block text-gray-500">Reserve Price</span>
              <span className="font-mono font-semibold text-white">
                {formatCurrency(auction.reservePrice)}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Total Bids</span>
              <span className="font-mono font-semibold text-indigo-400">
                {auction.totalSealedBids} Confidential
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
            <span>Seller: {formatAddress(auction.sellerAddress)}</span>
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <Link href={`/auctions/${auction.id}`} className="w-full">
          <Button variant={isBiddingActive ? "primary" : "outline"} className="w-full">
            {isBiddingActive ? "Submit Sealed Bid" : "View Auction Details"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
