import { NextResponse } from "next/server";
import { verifyVendorQualificationAction } from "@/actions/vendor-actions";
import { QualificationCheckRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      vendorId,
      requiredTurnoverUsd,
      requiredExperienceYears,
      actualTurnoverUsd,
      actualExperienceYears,
    } = body;

    if (!vendorId || requiredTurnoverUsd == null || requiredExperienceYears == null) {
      return NextResponse.json(
        { success: false, error: "Missing required qualification check parameters." },
        { status: 400 }
      );
    }

    const checkReq: QualificationCheckRequest = {
      vendorId,
      requiredTurnoverUsd: Number(requiredTurnoverUsd),
      requiredExperienceYears: Number(requiredExperienceYears),
    };

    const result = await verifyVendorQualificationAction(
      checkReq,
      Number(actualTurnoverUsd || 0),
      Number(actualExperienceYears || 0)
    );

    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API:vendor/verify] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during qualification verification." },
      { status: 500 }
    );
  }
}
