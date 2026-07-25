import { NextResponse } from "next/server";
import {
  submitStage2TechnicalProposalAction,
  evaluateStage2TechnicalAction,
} from "@/actions/procurement-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "EVALUATE") {
      const { procurementId, anonymousBidderId, status, technicalScore } = body;
      if (!procurementId || !anonymousBidderId || !status) {
        return NextResponse.json(
          { success: false, error: "Missing required technical evaluation parameters." },
          { status: 400 }
        );
      }

      const result = await evaluateStage2TechnicalAction({
        procurementId,
        anonymousBidderId,
        status,
        technicalScore: Number(technicalScore || 0),
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const {
      procurementId,
      anonymousBidderId,
      technicalSpecs,
      methodology,
      deliveryTimelineDays,
      equipmentSummary,
    } = body;

    if (!procurementId || !anonymousBidderId || !technicalSpecs || !methodology) {
      return NextResponse.json(
        { success: false, error: "Missing required Stage 2 technical proposal parameters." },
        { status: 400 }
      );
    }

    const result = await submitStage2TechnicalProposalAction({
      procurementId,
      anonymousBidderId,
      technicalSpecs,
      methodology,
      deliveryTimelineDays: Number(deliveryTimelineDays || 30),
      equipmentSummary: equipmentSummary || "",
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/stage2/technical] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during Stage 2 technical proposal handling." },
      { status: 500 }
    );
  }
}
