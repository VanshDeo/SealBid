import { NextResponse } from "next/server";
import {
  submitStage3CommercialBidAction,
  evaluateStage3AwardAction,
} from "@/actions/procurement-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "AWARD") {
      const { procurementId, winningAnonymousBidderId } = body;
      if (!procurementId || !winningAnonymousBidderId) {
        return NextResponse.json(
          { success: false, error: "Missing required commercial award parameters." },
          { status: 400 }
        );
      }

      const result = await evaluateStage3AwardAction({
        procurementId,
        winningAnonymousBidderId,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const { procurementId, anonymousBidderId, bidAmountUsd } = body;

    if (!procurementId || !anonymousBidderId || bidAmountUsd == null) {
      return NextResponse.json(
        { success: false, error: "Missing required Stage 3 commercial bid parameters." },
        { status: 400 }
      );
    }

    const result = await submitStage3CommercialBidAction({
      procurementId,
      anonymousBidderId,
      bidAmountUsd: Number(bidAmountUsd),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/stage3/commercial] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during Stage 3 commercial bid processing." },
      { status: 500 }
    );
  }
}
