import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { APP_NAME } from "@/lib/constants";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      app: APP_NAME,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      midnightNetwork: {
        networkId: env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID,
        nodeUrl: env.NEXT_PUBLIC_MIDNIGHT_NODE_URL,
        indexerUrl: env.NEXT_PUBLIC_MIDNIGHT_INDEXER_URL,
        proofServerUrl: env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL,
      },
    },
    { status: 200 }
  );
}
