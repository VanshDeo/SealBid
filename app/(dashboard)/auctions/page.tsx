import { getAuctionsAction } from "@/actions/auction-actions";
import { AuctionCard } from "@/components/auction/auction-card";

export default async function AuctionsPage() {
  const auctions = await getAuctionsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Auctions Directory</h1>
        <p className="text-sm text-gray-400">
          Browse live, revealing, and settled confidential zero-knowledge auctions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}
