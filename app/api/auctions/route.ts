import { NextResponse } from "next/server";
import { getAuctionsAction } from "@/actions/auction-actions";

export async function GET() {
  try {
    const auctions = await getAuctionsAction();
    // Convert BigInt values to string for JSON serialization
    const serializedAuctions = auctions.map((a) => ({
      ...a,
      reservePrice: a.reservePrice.toString(),
      highestBid: a.highestBid ? a.highestBid.toString() : undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        count: serializedAuctions.length,
        auctions: serializedAuctions,
      },
      { status: 200 }
    );
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch auction metadata.",
      },
      { status: 500 }
    );
  }
}
