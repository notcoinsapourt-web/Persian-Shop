import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, destroySession, SESSION_COOKIE } from "../../../../lib/web-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await destroySession(request.cookies.get(SESSION_COOKIE)?.value);
  } catch (error) {
    console.error("web logout cleanup failed", error);
  }
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
