import { NextResponse } from "next/server";
import { revealStage4WinningLegalDocAction } from "@/actions/procurement-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { procurementId, buyerWalletAddress, winningVendorWalletAddress, vendorProfile } = body;

    if (!procurementId || !buyerWalletAddress || !winningVendorWalletAddress || !vendorProfile) {
      return NextResponse.json(
        { success: false, error: "Missing required Stage 4 selective legal reveal parameters." },
        { status: 400 }
      );
    }

    const result = await revealStage4WinningLegalDocAction({
      procurementId,
      buyerWalletAddress,
      winningVendorWalletAddress,
      vendorProfile,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/stage4/legal-reveal] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during Stage 4 legal reveal." },
      { status: 500 }
    );
  }
}
