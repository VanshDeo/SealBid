import { NextResponse } from "next/server";
import { submitStage1EligibilityAction } from "@/actions/procurement-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { procurementId, vendorWalletAddress, vendorTurnoverUsd, vendorExperienceYears } = body;

    if (!procurementId || !vendorWalletAddress || vendorTurnoverUsd == null || vendorExperienceYears == null) {
      return NextResponse.json(
        { success: false, error: "Missing required Stage 1 parameters." },
        { status: 400 }
      );
    }

    const result = await submitStage1EligibilityAction({
      procurementId,
      vendorWalletAddress,
      vendorTurnoverUsd: Number(vendorTurnoverUsd),
      vendorExperienceYears: Number(vendorExperienceYears),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/stage1/verify] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during Stage 1 ZK eligibility verification." },
      { status: 500 }
    );
  }
}
