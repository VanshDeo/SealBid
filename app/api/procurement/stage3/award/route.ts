import { NextResponse } from "next/server";
import { evaluateStage3AwardAction } from "@/actions/procurement-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { procurementId, winningAnonymousBidderId } = body;

    if (!procurementId) {
      return NextResponse.json(
        { success: false, error: "Missing required procurementId parameter." },
        { status: 400 }
      );
    }

    const result = await evaluateStage3AwardAction({
      procurementId,
      winningAnonymousBidderId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/stage3/award] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during confidential winner evaluation." },
      { status: 500 }
    );
  }
}
