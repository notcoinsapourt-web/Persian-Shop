import { NextRequest, NextResponse } from "next/server";
import { RIVA_FONT_400 } from "../../../../../lib/riva-font-400";
import { RIVA_FONT_700 } from "../../../../../lib/riva-font-700";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ weight: string }> }) {
  const { weight } = await context.params;
  const data = weight === "700" ? RIVA_FONT_700 : RIVA_FONT_400;
  const response = new NextResponse(Buffer.from(data, "base64"));
  response.headers.set("content-type", "font/woff2");
  response.headers.set("cache-control", "public, max-age=31536000, immutable");
  return response;
}
