import { NextResponse } from "next/server";
import { getStoreData } from "../../../../lib/store-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
  const data = await getStoreData();
  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
  } catch {
    return NextResponse.json({ error: "فهرست محصولات موقتاً در دسترس نیست." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
