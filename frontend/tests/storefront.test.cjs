const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');

function loadTS(file, mocks = {}) {
  let code = stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { mode: 'transform' });
  code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g, (_, names, source) => `const {${names}} = require(${JSON.stringify(source)});`);
  const exports = [...code.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(\w+)/g)].map(match => match[1]);
  code = code.replace(/export\s+(?=(?:async\s+)?(?:function|const)\s)/g, '') + '\nObject.assign(module.exports, {' + exports.join(',') + '});';
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => id in mocks ? mocks[id] : require(id), module, module.exports);
  return module.exports;
}
const state = loadTS('components/store/catalog-state.ts');
const product = { id: 1, slug: 'service', name: 'سرویس', price: 100, image: '', category: 'ai', en: '', description: '', emoji: '', inputPrompt: '' };

test('Persian search matches Arabic letters, both digit sets and half spaces', () => {
  assert.equal(state.normalizeSearch('  تيك‌تاك ۱٠۰  '), 'تیک تاک 100');
  assert.equal(state.normalizeSearch('ChatGPT PLUS'), 'chatgpt plus');
});
test('Cart restoration rejects malformed state and uses current catalog prices', () => {
  assert.deepEqual(state.restoreCart({ malicious: true }, [product]), []);
  const lines = state.restoreCart([{ product: { ...product, price: 1 }, qty: 2, input: 'public-link' }, { product, qty: -2, input: 'x' }, { product, qty: 1.5, input: 'x' }, null], [product]);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].product.price, 100);
  assert.equal(lines[0].qty, 2);
  assert.equal(lines[0].input, 'public-link');
});
test('Catalog refresh preserves quantity/input and marks unavailable products', () => {
  const original = [{ product, qty: 3, input: 'do-not-erase' }];
  const next = state.syncCart(original, [{ ...product, price: 150 }]);
  assert.equal(next[0].product.price, 150);
  assert.equal(next[0].qty, 3);
  assert.equal(next[0].input, 'do-not-erase');
  assert.equal(state.syncCart(original, [])[0].unavailable, true);
  assert.equal(original[0].product.price, 100);
});

function checkoutHarness({ price = 100, duplicate = false, user = { id: 7 } } = {}) {
  const calls = [];
  const client = {
    async query(sql, args) {
      calls.push({ sql, args });
      if (sql.includes('FROM web_checkout_batches')) return { rowCount: duplicate ? 1 : 0, rows: duplicate ? [{ id: 9 }] : [] };
      if (sql.includes('FROM products')) return { rowCount: 1, rows: [{ id: 1, name: 'سرویس', price }] };
      if (sql.includes('FROM web_wallets')) return { rowCount: 1, rows: [{ id: 8, balance: 1000 }] };
      if (sql.includes('INSERT INTO web_checkout_batches')) return { rows: [{ id: 9, batch_number: 'WBTEST' }] };
      if (sql.includes('web_orders')) return { rows: [{ id: 10, number: 'WTEST', total_amount: 200 }] };
      return { rows: [], rowCount: 0 };
    }, release() { calls.push({ sql: 'RELEASE' }); }
  };
  const { POST } = loadTS('app/api/orders/route.ts', {
    'next/server': { NextResponse: { json: (body, opts) => new Response(JSON.stringify(body), { status: opts?.status || 200 }) } },
    '../../../lib/web-auth': { getSessionUser: async () => user },
    '../../../lib/web-db': { ensureWebSchema: async () => {}, getWebPool: () => ({ connect: async () => client }) }
  });
  return { calls, post: (overrides = {}) => POST({ json: async () => ({ checkoutKey: 'stable-retry-key', lines: [{ productId: 1, qty: 2, input: 'public-link', expectedUnitPrice: 100, ...overrides }] }) }) };
}
test('Changed price is rejected before any wallet debit or order creation', async () => {
  const h = checkoutHarness({ price: 150 });
  const response = await h.post();
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, 'PRICE_CHANGED');
  assert.ok(h.calls.some(call => call.sql === 'ROLLBACK'));
  assert.ok(!h.calls.some(call => /UPDATE|INSERT/.test(call.sql)));
});
test('Accepted displayed price produces the correct debit and order total', async () => {
  const h = checkoutHarness();
  const response = await h.post();
  assert.equal(response.status, 201);
  assert.equal((await response.json()).balance, 800);
  assert.equal(h.calls.find(call => call.sql.includes('UPDATE web_wallets')).args[0], 800);
  assert.equal(h.calls.find(call => call.sql.includes('INSERT INTO web_orders')).args[7], 200);
});
test('Retry reuses existing checkout and never charges a second time', async () => {
  const h = checkoutHarness({ duplicate: true });
  const response = await h.post();
  assert.equal((await response.json()).duplicate, true);
  assert.ok(h.calls[1].sql.includes('pg_advisory_xact_lock'));
  assert.ok(!h.calls.some(call => /UPDATE|INSERT/.test(call.sql)));
});
test('Invalid quantity, missing consent price or missing input does not start checkout', async () => {
  for (const invalid of [{ qty: 1.5 }, { expectedUnitPrice: undefined }, { expectedUnitPrice: -1 }, { input: '' }]) {
    const h = checkoutHarness();
    assert.equal((await h.post(invalid)).status, 400);
    assert.equal(h.calls.length, 0);
  }
});
test('Guest checkout is blocked', async () => {
  const h = checkoutHarness({ user: null });
  assert.equal((await h.post()).status, 401);
  assert.equal(h.calls.length, 0);
});
test('Toman to USDT cents rounds up without mixing rial and toman', () => {
  const { tomanToCents } = loadTS('lib/exchange-rate.ts');
  assert.equal(tomanToCents(100000, 100000), 100);
  assert.equal(tomanToCents(100001, 100000), 101);
  assert.equal(tomanToCents(10000, 125000), 8);
  assert.throws(() => tomanToCents(10000, 0));
});
