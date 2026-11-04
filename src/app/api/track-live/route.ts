import { NextRequest, NextResponse } from "next/server";
import { trackSLPostBarcode } from "@/lib/slpost";

export async function GET(request: NextRequest) {
  try {
    const barcode = request.nextUrl.searchParams.get("barcode");

    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json(
        { error: "Barcode query parameter is required." },
        { status: 400 }
      );
    }

    const trimmed = barcode.trim().toUpperCase();
    if (trimmed.length < 5 || trimmed.length > 20) {
      return NextResponse.json(
        { error: "Invalid barcode format." },
        { status: 400 }
      );
    }

    const result = await trackSLPostBarcode(trimmed);
    return NextResponse.json(result);
  } catch (err: unknown) {
    // If Next.js internal prerender bailout, rethrow
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_PRERENDER")
    ) {
      throw err;
    }
    console.error("Error in /api/track-live:", err);
    return NextResponse.json(
      {
        barcode: "",
        status: "Not Found",
        events: [],
        error: "Internal server error fetching SL Post tracking",
      },
      { status: 500 }
    );
  }
}
