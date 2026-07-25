import { NextResponse } from "next/server";
import { verifyConfidentialEligibilityAction } from "@/actions/procurement-actions";
import { ConfidentialEligibilityCheckInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfidentialEligibilityCheckInput;

    if (!body.procurementId || !body.vendorId || !body.privateWitness) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required procurementId, vendorId, or privateWitness document parameters.",
        },
        { status: 400 }
      );
    }

    const result = await verifyConfidentialEligibilityAction(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/verify-eligibility] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error during Compact ZK smart contract eligibility proof verification.",
      },
      { status: 500 }
    );
  }
}
