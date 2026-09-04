import { NextRequest, NextResponse } from "next/server";
import { createSession, normalizeEmail, setSessionCookie, verifyPassword } from "../../../../lib/web-auth";
import { ensureWebSchema, getWebPool } from "../../../../lib/web-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureWebSchema();
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");
    if (!email || !password) return NextResponse.json({ error: "ایمیل و رمز عبور را وارد کنید." }, { status: 400 });

    const db = getWebPool();
    const result = await db.query(
      `SELECT u.id, u.email, u.phone, u.created_at, u.password_hash, u.is_active, w.balance
         FROM web_users u JOIN web_wallets w ON w.user_id = u.id
        WHERE u.email = $1 LIMIT 1`,
      [email]
    );
    if (!result.rowCount) return NextResponse.json({ error: "ایمیل یا رمز عبور نادرست است." }, { status: 401 });
    const row = result.rows[0];
    if (!row.is_active || !(await verifyPassword(password, String(row.password_hash)))) {
      return NextResponse.json({ error: "ایمیل یا رمز عبور نادرست است." }, { status: 401 });
    }

    await db.query(`UPDATE web_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`, [row.id]);
    const session = await createSession(Number(row.id), request.headers.get("user-agent") || "");
    const response = NextResponse.json({ user: { id: Number(row.id), email: String(row.email), phone: row.phone ? String(row.phone) : null, balance: Number(row.balance || 0), createdAt: new Date(row.created_at).toISOString() } });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("web login failed", error);
    return NextResponse.json({ error: "ورود انجام نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}
