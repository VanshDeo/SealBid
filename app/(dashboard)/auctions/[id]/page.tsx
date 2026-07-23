import { notFound } from "next/navigation";
import { getAuctionByIdAction } from "@/actions/auction-actions";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SealedBidForm } from "@/components/auction/sealed-bid-form";

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await getAuctionByIdAction(id);

  if (!auction) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={auction.status === "ACTIVE" ? "active" : "revealing"}>
              {auction.status}
            </Badge>
            <span className="rounded-full border border-cyan-800/40 bg-cyan-950/40 px-2 py-0.5 font-mono text-xs text-cyan-400">
              Compact Contract # {auction.id}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{auction.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Asset Details */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-300">{auction.description}</p>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-500">Asset Name</span>
                  <span className="font-medium text-white">{auction.assetName}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Seller Address</span>
                  <span className="font-mono text-gray-300">
                    {formatAddress(auction.sellerAddress)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Reserve Price</span>
                  <span className="font-mono font-semibold text-white">
                    {formatCurrency(auction.reservePrice)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Total Sealed Bids</span>
                  <span className="font-mono font-semibold text-indigo-400">
                    {auction.totalSealedBids} Bids
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compact Contract State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-xs">
              <div className="flex justify-between rounded bg-gray-950/40 p-2">
                <span className="text-gray-500">Contract Address:</span>
                <span className="text-gray-300">{auction.contractAddress}</span>
              </div>
              <div className="flex justify-between rounded bg-gray-950/40 p-2">
                <span className="text-gray-500">Bidding Deadline:</span>
                <span className="text-gray-300">
                  {new Date(auction.biddingEndTime).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between rounded bg-gray-950/40 p-2">
                <span className="text-gray-500">Reveal Deadline:</span>
                <span className="text-gray-300">
                  {new Date(auction.revealEndTime).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sealed Bid Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Confidential Bid</CardTitle>
            </CardHeader>
            <CardContent>
              <SealedBidForm auctionId={auction.id} reservePrice={auction.reservePrice} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
