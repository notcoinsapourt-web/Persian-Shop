import { NextResponse } from "next/server";
import { getStoreData } from "../../../../lib/store-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getStoreData();
  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
