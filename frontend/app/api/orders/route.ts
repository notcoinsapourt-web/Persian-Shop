import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/web-auth";
import { ensureWebSchema, getWebPool } from "../../../lib/web-db";

export const runtime = "nodejs";

type CheckoutLine = {
  productId: number;
  qty: number;
  input: string;
};

type PreparedLine = CheckoutLine & {
  name: string;
  unitPrice: number;
  total: number;
};

const orderNumber = () => `W${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;
const batchNumber = () => `WB${Date.now().toString(36).toUpperCase()}${randomBytes(3).toString("hex").toUpperCase()}`;

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401 });
    await ensureWebSchema();
    const result = await getWebPool().query(
      `SELECT id, number, product_name, quantity, total_amount, customer_input, status, admin_note, created_at, completed_at, cancelled_at
         FROM web_orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [user.id]
    );
    return NextResponse.json({ orders: result.rows.map(row => ({ ...row, id: Number(row.id), quantity: Number(row.quantity), total_amount: Number(row.total_amount) })) });
  } catch (error) {
    console.error("web orders list failed", error);
    return NextResponse.json({ error: "دریافت سفارش‌ها انجام نشد." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "برای ثبت سفارش ابتدا وارد حساب شوید." }, { status: 401 });
    await ensureWebSchema();
    const body: unknown = await request.json();
    const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const checkoutKey = String(payload.checkoutKey || "").trim();
    const rawLines: unknown[] = Array.isArray(payload.lines) ? payload.lines : [];
    if (!checkoutKey || rawLines.length < 1 || rawLines.length > 25) return NextResponse.json({ error: "سبد خرید معتبر نیست." }, { status: 400 });

    const lines: CheckoutLine[] = rawLines.map((raw: unknown) => {
      const line = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
      return {
        productId: Number(line.productId),
        qty: Math.floor(Number(line.qty)),
        input: String(line.input ?? "").trim(),
      };
    });
    if (lines.some((line: CheckoutLine) => !Number.isInteger(line.productId) || line.productId <= 0 || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 10000)) {
      return NextResponse.json({ error: "اطلاعات یکی از محصولات معتبر نیست." }, { status: 400 });
    }

    const db = getWebPool();
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const existingBatch = await client.query(
        `SELECT id FROM web_checkout_batches WHERE checkout_key = $1 AND user_id = $2 LIMIT 1`,
        [checkoutKey, user.id]
      );
      if (existingBatch.rowCount) {
        const existingOrders = await client.query(
          `SELECT id, number, product_name, quantity, total_amount, status, created_at FROM web_orders WHERE batch_id = $1 ORDER BY id`,
          [existingBatch.rows[0].id]
        );
        const wallet = await client.query(`SELECT balance FROM web_wallets WHERE user_id = $1`, [user.id]);
        await client.query("COMMIT");
        return NextResponse.json({ orders: existingOrders.rows, balance: Number(wallet.rows[0]?.balance || 0), duplicate: true });
      }

      const ids = [...new Set(lines.map((line: CheckoutLine) => line.productId))];
      const products = await client.query(
        `SELECT id, name, price FROM products WHERE id = ANY($1::bigint[]) AND is_active = TRUE`,
        [ids]
      );
      const productMap = new Map<number, { id: unknown; name: unknown; price: unknown }>(
        products.rows.map(row => [Number(row.id), row as { id: unknown; name: unknown; price: unknown }])
      );
      if (productMap.size !== ids.length) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "یکی از محصولات دیگر قابل سفارش نیست. سبد را تازه‌سازی کنید." }, { status: 409 });
      }

      const prepared: PreparedLine[] = lines.map((line: CheckoutLine) => {
        const product = productMap.get(line.productId)!;
        const unitPrice = Number(product.price);
        return { ...line, name: String(product.name), unitPrice, total: unitPrice * line.qty };
      });
      const total = prepared.reduce((sum: number, line: PreparedLine) => sum + line.total, 0);
      const wallet = await client.query(`SELECT id, balance FROM web_wallets WHERE user_id = $1 FOR UPDATE`, [user.id]);
      if (!wallet.rowCount) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "کیف پول حساب پیدا نشد." }, { status: 409 });
      }
      const walletId = Number(wallet.rows[0].id);
      const balanceBefore = Number(wallet.rows[0].balance || 0);
      if (balanceBefore < total) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "موجودی کیف پول برای ثبت این سفارش کافی نیست.", code: "INSUFFICIENT_BALANCE", balance: balanceBefore, required: total }, { status: 402 });
      }

      const batch = await client.query(
        `INSERT INTO web_checkout_batches (batch_number, checkout_key, user_id, total_amount) VALUES ($1, $2, $3, $4) RETURNING id, batch_number`,
        [batchNumber(), checkoutKey, user.id, total]
      );
      const balanceAfter = balanceBefore - total;
      await client.query(`UPDATE web_wallets SET balance = $1, updated_at = NOW() WHERE id = $2`, [balanceAfter, walletId]);
      await client.query(
        `INSERT INTO web_wallet_transactions (wallet_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, idempotency_key)
         VALUES ($1, 'order', $2, $3, $4, $5, 'web_checkout', $6, $7)`,
        [walletId, total, balanceBefore, balanceAfter, "پرداخت سفارش سایت", String(batch.rows[0].id), `web-checkout:${checkoutKey}`]
      );

      const created: Array<Record<string, unknown>> = [];
      for (const line of prepared) {
        const inserted = await client.query(
          `INSERT INTO web_orders (number, batch_id, user_id, product_id, product_name, unit_price, quantity, total_amount, customer_input, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
           RETURNING id, number, product_name, quantity, total_amount, status, created_at`,
          [orderNumber(), batch.rows[0].id, user.id, line.productId, line.name, line.unitPrice, line.qty, line.total, line.input]
        );
        created.push(inserted.rows[0] as Record<string, unknown>);
      }
      await client.query("COMMIT");
      return NextResponse.json({ orders: created, batchNumber: batch.rows[0].batch_number, balance: balanceAfter }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("web checkout failed", error);
    return NextResponse.json({ error: "ثبت سفارش انجام نشد. مبلغی از کیف پول کم نشده است." }, { status: 500 });
  }
}
