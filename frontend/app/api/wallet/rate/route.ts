import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/web-auth";
import { getUsdtRate } from "../../../../lib/exchange-rate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401 });
  try {
    const rate = await getUsdtRate(request.nextUrl.searchParams.get("refresh") === "1");
    return NextResponse.json(rate, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("exchange rate unavailable", error);
    return NextResponse.json(
      { error: "نرخ معتبر در دسترس نیست. پرداخت ارزی موقتاً غیرفعال است." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
