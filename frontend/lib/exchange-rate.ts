type RateSnapshot = {
  rateToman: number;
  source: string;
  fetchedAt: string;
  expiresAt: string;
  stale: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __persianShopRate: RateSnapshot | undefined;
}

const TTL_MS = 2 * 60 * 1000;
const STALE_MS = 30 * 60 * 1000;

const validRate = (value: unknown) => {
  const rate = Math.round(Number(value));
  return Number.isSafeInteger(rate) && rate >= 10_000 && rate <= 10_000_000 ? rate : 0;
};

export async function getUsdtRate(force = false): Promise<RateSnapshot> {
  const now = Date.now();
  const cached = globalThis.__persianShopRate;
  if (!force && cached && Date.parse(cached.expiresAt) > now) return cached;

  try {
    const response = await fetch("https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls", {
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
      headers: { accept: "application/json", "user-agent": "PersianShop/1.0" },
    });
    if (!response.ok) throw new Error(`rate source returned ${response.status}`);
    const payload = await response.json();
    const market = payload?.stats?.["usdt-rls"] || payload?.stats?.["USDT-RLS"];
    const rial = Number(market?.bestSell || market?.latest || market?.mark || 0);
    const rateToman = validRate(rial / 10);
    if (!rateToman) throw new Error("invalid USDT/RLS rate");
    const fetchedAt = new Date(now).toISOString();
    const snapshot = { rateToman, source: "Nobitex USDT/RLS", fetchedAt, expiresAt: new Date(now + TTL_MS).toISOString(), stale: false };
    globalThis.__persianShopRate = snapshot;
    return snapshot;
  } catch (error) {
    if (cached && now - Date.parse(cached.fetchedAt) <= STALE_MS) return { ...cached, stale: true };
    const manual = validRate(process.env.USDT_RATE_TOMAN);
    if (manual) {
      const fetchedAt = new Date(now).toISOString();
      return { rateToman: manual, source: "نرخ پشتیبان مدیریت", fetchedAt, expiresAt: new Date(now + TTL_MS).toISOString(), stale: true };
    }
    throw error;
  }
}

export function tomanToCents(amountToman: number, rateToman: number): number {
  if (!Number.isSafeInteger(amountToman) || amountToman <= 0 || !Number.isSafeInteger(rateToman) || rateToman <= 0) throw new Error("invalid money values");
  return Math.ceil((amountToman * 100) / rateToman);
}
