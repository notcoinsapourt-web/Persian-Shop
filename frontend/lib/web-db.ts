import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __persianShopWebPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __persianShopSchemaPromise: Promise<void> | undefined;
}

export function getWebPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!globalThis.__persianShopWebPool) {
    globalThis.__persianShopWebPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 8 });
  }
  return globalThis.__persianShopWebPool;
}

export async function ensureWebSchema(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  if (globalThis.__persianShopSchemaPromise) return globalThis.__persianShopSchemaPromise;

  globalThis.__persianShopSchemaPromise = (async () => {
    const db = getWebPool();
    await db.query(`
      CREATE TABLE IF NOT EXISTS web_users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        phone TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS web_wallets (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL UNIQUE REFERENCES web_users(id) ON DELETE CASCADE,
        balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS web_sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES web_users(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        user_agent TEXT
      );

      CREATE INDEX IF NOT EXISTS ix_web_sessions_user ON web_sessions(user_id);
      CREATE INDEX IF NOT EXISTS ix_web_sessions_expiry ON web_sessions(expires_at);

      CREATE TABLE IF NOT EXISTS web_wallet_transactions (
        id BIGSERIAL PRIMARY KEY,
        wallet_id BIGINT NOT NULL REFERENCES web_wallets(id) ON DELETE RESTRICT,
        transaction_type VARCHAR(32) NOT NULL,
        amount BIGINT NOT NULL CHECK (amount > 0),
        balance_before BIGINT NOT NULL,
        balance_after BIGINT NOT NULL,
        description TEXT NOT NULL,
        reference_type VARCHAR(40),
        reference_id VARCHAR(80),
        idempotency_key VARCHAR(160) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS ix_web_wallet_transactions_wallet ON web_wallet_transactions(wallet_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS web_checkout_batches (
        id BIGSERIAL PRIMARY KEY,
        batch_number VARCHAR(30) NOT NULL UNIQUE,
        checkout_key VARCHAR(120) NOT NULL UNIQUE,
        user_id BIGINT NOT NULL REFERENCES web_users(id) ON DELETE RESTRICT,
        total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS web_orders (
        id BIGSERIAL PRIMARY KEY,
        number VARCHAR(30) NOT NULL UNIQUE,
        batch_id BIGINT NOT NULL REFERENCES web_checkout_batches(id) ON DELETE RESTRICT,
        user_id BIGINT NOT NULL REFERENCES web_users(id) ON DELETE RESTRICT,
        product_id BIGINT,
        product_name TEXT NOT NULL,
        unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
        customer_input TEXT NOT NULL DEFAULT '',
        status VARCHAR(24) NOT NULL DEFAULT 'pending',
        admin_note TEXT,
        completed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        refunded_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS ix_web_orders_user ON web_orders(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS ix_web_orders_status ON web_orders(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS ix_web_orders_batch ON web_orders(batch_id);

      CREATE TABLE IF NOT EXISTS web_deposits (
        id BIGSERIAL PRIMARY KEY,
        number VARCHAR(30) NOT NULL UNIQUE,
        user_id BIGINT NOT NULL REFERENCES web_users(id) ON DELETE RESTRICT,
        method VARCHAR(20) NOT NULL,
        amount BIGINT NOT NULL CHECK (amount > 0),
        proof_name TEXT NOT NULL,
        proof_mime VARCHAR(80) NOT NULL,
        proof_bytes BYTEA NOT NULL,
        transaction_hash TEXT,
        exchange_rate_toman BIGINT,
        crypto_amount_cents BIGINT,
        rate_source TEXT,
        rate_fetched_at TIMESTAMPTZ,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        reviewed_by_telegram_id BIGINT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS ix_web_deposits_user ON web_deposits(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS ix_web_deposits_status ON web_deposits(status, created_at DESC);

      ALTER TABLE web_deposits ADD COLUMN IF NOT EXISTS exchange_rate_toman BIGINT;
      ALTER TABLE web_deposits ADD COLUMN IF NOT EXISTS crypto_amount_cents BIGINT;
      ALTER TABLE web_deposits ADD COLUMN IF NOT EXISTS rate_source TEXT;
      ALTER TABLE web_deposits ADD COLUMN IF NOT EXISTS rate_fetched_at TIMESTAMPTZ;
    `);
  })().catch(error => {
    globalThis.__persianShopSchemaPromise = undefined;
    throw error;
  });

  return globalThis.__persianShopSchemaPromise;
}
