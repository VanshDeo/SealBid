import { NextResponse } from "next/server";
import { getProcurementsAction } from "@/actions/procurement-actions";

export async function GET() {
  try {
    const rfps = await getProcurementsAction();
    return NextResponse.json(
      {
        success: true,
        count: rfps.length,
        procurements: rfps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API:procurement/list] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch procurement RFPs." },
      { status: 500 }
    );
  }
}
