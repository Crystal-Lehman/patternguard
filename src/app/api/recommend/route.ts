import { NextRequest, NextResponse } from "next/server";
import { recommendStandards } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { standards } = body;

    if (!standards || !Array.isArray(standards)) {
      return NextResponse.json(
        { error: "Standards array is required" },
        { status: 400 }
      );
    }

    const result = await recommendStandards(standards);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendation error:", error);
    const message =
      error instanceof Error ? error.message : "Recommendation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
