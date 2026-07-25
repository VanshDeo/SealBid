import { NextResponse } from "next/server";
import { createProcurementAction, CreateProcurementInput } from "@/actions/procurement-actions";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProcurementInput;
    if (!body.title || !body.buyerAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required procurement title or buyer address." },
        { status: 400 }
      );
    }

    const result = await createProcurementAction(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API:procurement/create] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during procurement creation." },
      { status: 500 }
    );
  }
}
