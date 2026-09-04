import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/web-auth";
import { ensureWebSchema, getWebPool } from "../../../lib/web-db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401 });
    await ensureWebSchema();
    const db = getWebPool();
    const [wallet, transactions, deposits] = await Promise.all([
      db.query(`SELECT id, balance FROM web_wallets WHERE user_id = $1 LIMIT 1`, [user.id]),
      db.query(
        `SELECT transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, created_at
           FROM web_wallet_transactions
          WHERE wallet_id = (SELECT id FROM web_wallets WHERE user_id = $1)
          ORDER BY created_at DESC LIMIT 20`,
        [user.id]
      ),
      db.query(
        `SELECT id, number, method, amount, status, created_at, reviewed_at
           FROM web_deposits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [user.id]
      ),
    ]);
    return NextResponse.json({
      balance: Number(wallet.rows[0]?.balance || 0),
      transactions: transactions.rows.map(row => ({ ...row, amount: Number(row.amount), balance_before: Number(row.balance_before), balance_after: Number(row.balance_after) })),
      deposits: deposits.rows.map(row => ({ ...row, id: Number(row.id), amount: Number(row.amount) })),
    });
  } catch (error) {
    console.error("web wallet lookup failed", error);
    return NextResponse.json({ error: "دریافت اطلاعات کیف پول انجام نشد." }, { status: 500 });
  }
}
