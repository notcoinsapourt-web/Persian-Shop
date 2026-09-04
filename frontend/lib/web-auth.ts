import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { NextRequest, NextResponse } from "next/server";
import { ensureWebSchema, getWebPool } from "./web-db";

const scrypt = promisify(nodeScrypt);
export const SESSION_COOKIE = "ps_session";
const SESSION_DAYS = 30;

export type WebSessionUser = {
  id: number;
  email: string;
  phone: string | null;
  balance: number;
  createdAt: string;
};

export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [scheme, salt, storedHex] = encoded.split("$");
  if (scheme !== "scrypt" || !salt || !storedHex) return false;
  const stored = Buffer.from(storedHex, "hex");
  const derived = (await scrypt(password, salt, stored.length)) as Buffer;
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

function sessionHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number, userAgent = ""): Promise<{ token: string; expiresAt: Date }> {
  await ensureWebSchema();
  const db = getWebPool();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO web_sessions (user_id, token_hash, expires_at, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [userId, sessionHash(token), expiresAt, userAgent.slice(0, 1000)]
  );
  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token || !process.env.DATABASE_URL) return;
  await ensureWebSchema();
  await getWebPool().query(`DELETE FROM web_sessions WHERE token_hash = $1`, [sessionHash(token)]);
}

export async function getSessionUser(request: NextRequest): Promise<WebSessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !process.env.DATABASE_URL) return null;
  await ensureWebSchema();
  const db = getWebPool();
  const result = await db.query(
    `SELECT u.id, u.email, u.phone, u.created_at, w.balance
       FROM web_sessions s
       JOIN web_users u ON u.id = s.user_id
       JOIN web_wallets w ON w.user_id = u.id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND u.is_active = TRUE
      LIMIT 1`,
    [sessionHash(token)]
  );
  if (!result.rowCount) return null;
  void db.query(`UPDATE web_sessions SET last_seen_at = NOW() WHERE token_hash = $1`, [sessionHash(token)]).catch(() => {});
  const row = result.rows[0];
  return { id: Number(row.id), email: String(row.email), phone: row.phone ? String(row.phone) : null, balance: Number(row.balance || 0), createdAt: new Date(row.created_at).toISOString() };
}
