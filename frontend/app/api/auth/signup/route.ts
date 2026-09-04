import { NextRequest, NextResponse } from "next/server";
import { createSession, hashPassword, normalizeEmail, setSessionCookie } from "../../../../lib/web-auth";
import { ensureWebSchema, getWebPool } from "../../../../lib/web-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureWebSchema();
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");
    const passwordRepeat = String(body.passwordRepeat ?? "");
    const phone = String(body.phone ?? "").trim() || null;

    if (!email || !password) return NextResponse.json({ error: "ایمیل و رمز عبور الزامی است." }, { status: 400 });
    if (password !== passwordRepeat) return NextResponse.json({ error: "تکرار رمز عبور با رمز اصلی یکسان نیست." }, { status: 400 });

    const db = getWebPool();
    const exists = await db.query(`SELECT 1 FROM web_users WHERE email = $1 LIMIT 1`, [email]);
    if (exists.rowCount) return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO web_users (email, password_hash, phone, last_login_at)
         VALUES ($1, $2, $3, NOW()) RETURNING id, email, phone`,
        [email, passwordHash, phone]
      );
      const user = inserted.rows[0];
      await client.query(`INSERT INTO web_wallets (user_id, balance) VALUES ($1, 0)`, [user.id]);
      await client.query("COMMIT");

      const session = await createSession(Number(user.id), request.headers.get("user-agent") || "");
      const response = NextResponse.json({ user: { id: Number(user.id), email: user.email, phone: user.phone, balance: 0 } }, { status: 201 });
      setSessionCookie(response, session.token, session.expiresAt);
      return response;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("web signup failed", error);
    return NextResponse.json({ error: "ثبت‌نام انجام نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}
