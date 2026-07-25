import { NextResponse } from "next/server";
import { registerVendorAction, RegisterVendorPayload } from "@/actions/vendor-actions";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterVendorPayload;
    if (!body.walletAddress || !body.profile) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload. Wallet address and profile required." },
        { status: 400 }
      );
    }

    const result = await registerVendorAction(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:vendor/register] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during vendor registration." },
      { status: 500 }
    );
  }
}
