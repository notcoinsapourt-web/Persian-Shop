import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/web-auth";
import { ensureWebSchema, getWebPool } from "../../../../lib/web-db";

export const runtime = "nodejs";

const depositNumber = () => `WD${Date.now().toString(36).toUpperCase()}${randomBytes(3).toString("hex").toUpperCase()}`;
const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "برای شارژ کیف پول ابتدا وارد حساب شوید." }, { status: 401 });
    await ensureWebSchema();

    const form = await request.formData();
    const amount = Math.floor(Number(form.get("amount") || 0));
    const method = String(form.get("method") || "");
    const transactionHash = String(form.get("transactionHash") || "").trim() || null;
    const receipt = form.get("receipt");

    if (!Number.isInteger(amount) || amount < 10000) return NextResponse.json({ error: "مبلغ شارژ معتبر نیست." }, { status: 400 });
    if (!new Set(["card", "crypto"]).has(method)) return NextResponse.json({ error: "روش پرداخت معتبر نیست." }, { status: 400 });
    if (!(receipt instanceof File)) return NextResponse.json({ error: "تصویر رسید را انتخاب کنید." }, { status: 400 });
    if (!allowedMime.has(receipt.type)) return NextResponse.json({ error: "فرمت رسید باید JPG، PNG یا WEBP باشد." }, { status: 400 });
    if (receipt.size < 1 || receipt.size > MAX_FILE_SIZE) return NextResponse.json({ error: "حجم رسید باید کمتر از ۵ مگابایت باشد." }, { status: 400 });

    const bytes = Buffer.from(await receipt.arrayBuffer());
    const number = depositNumber();
    const result = await getWebPool().query(
      `INSERT INTO web_deposits (number, user_id, method, amount, proof_name, proof_mime, proof_bytes, transaction_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING id, number, method, amount, status, created_at`,
      [number, user.id, method, amount, receipt.name.slice(0, 300), receipt.type, bytes, transactionHash]
    );
    const row = result.rows[0];
    return NextResponse.json({ deposit: { ...row, id: Number(row.id), amount: Number(row.amount) } }, { status: 201 });
  } catch (error) {
    console.error("web deposit submission failed", error);
    return NextResponse.json({ error: "ثبت رسید انجام نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}
