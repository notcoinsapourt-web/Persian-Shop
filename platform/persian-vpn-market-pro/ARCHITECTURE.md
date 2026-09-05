# Architecture decision — 2026-09-05

## Source review

| Source | Evidence | Decision |
|---|---|---|
| IranEclips/VPNMarket | Pinned 5a8225f, last commit 2026-02-27; Laravel 12/PHP 8.3 in composer.json despite older README; Filament 3; modules for MultiServer, Reseller, Referral, Ticketing and TelegramBot | Selected for framework/modularity fit, conditional on hardening; not described as bug-free |
| lovehrom/marzbot | README describes aiogram/Tortoise, Marzban-specific bot and wallet; repository page showed 8 commits and AGPL-3.0 | Smaller track record and less suitable for preferred Laravel admin; no claim of runtime testing |
| mahdiMGF2/mirzabot | Local reviewed a9774de, 2026-09-05; broad adapters and active updates; index.php 6,762 lines, admin.php 10,981 lines | More current but substantial separation needed for a unified modular backend |
| Gozargah/Marzban | VPN management panel and API | Panel integration target, not the commerce backend |
| MHSanaei/3x-ui | VPN management panel; Sanaei and 3X-UI names overlap in this ecosystem | Versioned adapter target; do not assume every X-UI fork uses identical API |
| hiddify/Hiddify-Manager | VPN management panel | Separate adapter and contract-test target |

Sources: https://github.com/IranEclips/VPNMarket, https://github.com/lovehrom/marzbot, https://github.com/mahdiMGF2/mirzabot, https://github.com/Gozargah/Marzban, https://github.com/MHSanaei/3x-ui, https://github.com/hiddify/Hiddify-Manager

No source passed a full commercial acceptance suite in this review. Star counts, READMEs and few open issues cannot establish absence of bugs.

## Confirmed findings in the pinned VPNMarket source

1. `app/Http/Middleware/TelegramWebAppAuth.php` returned true unconditionally from validateInitData; it also accepted a submitted user_id without Telegram signature. The overlay replaces this.
2. `app/Http/Controllers/OrderController.php::processWalletPayment` checks the balance before entering DB::transaction and decrements without an in-transaction user row lock. Concurrent payments require a redesigned atomic payment boundary; this path is not enabled.
3. `app/Services/MarzbanService.php` logs create payloads and panel responses, potentially including credentials/config material. Remove or redact before activation.
4. Inspected tests primarily cover Breeze authentication/profile and example tests. No validated payment/provisioning race coverage was established.
5. Telegram module webhook handler has no secret verification at its entry point. Secret middleware is prepared; route activation and update deduplication remain pending.

## Target architecture

A modular Laravel monolith, one relational database, one User identity, one Order lifecycle, and a single financial ledger shared by bot, Mini App and Filament. Redis provides queues and coordination; DB constraints remain the authority for payment uniqueness. Separate runtime processes use the same application version.

| Module | Responsibility / required invariant |
|---|---|
| VPN | Registry of adapters; snapshot normalization; deterministic external ID per order; reconciliation after ambiguous API timeouts |
| Store | Catalog, variants, stock reservation, encrypted one-time digital inventory, manual fulfillment |
| Wallet | Integer money; immutable ledger; row lock and sufficient-funds check in same transaction; idempotent credit/debit |
| Payment | Server-calculated price snapshots; provider callback verification; unique provider event; receipt review authorized by role |
| Order | State machine: pending → paid → provisioning → fulfilled; failed provisioning stays reconcilable, no blind refund or duplicate create |
| Notification | Transactional outbox; retry-safe delivery; no secret/config payloads in logs |
| Affiliate / reseller | Separate commission entries, configurable price policy, limits, refunds reversal and reports |
| Bot / Mini App | Thin clients of shared use cases; verified Telegram identity and owner-scoped data |
| Admin | Filament policies, audit records, restricted finance operations, explicit approval permissions |

Payment transaction: lock wallet and order; validate immutable price and order state; create unique payment and ledger entries; update paid state; insert outbox job; commit. A worker provisions afterwards. On timeout it queries deterministic external ID before retrying creation. Renewal uses absolute expiry/traffic targets, not repeated increments. No remote HTTP request inside the money transaction.

## Integration sequence

1. Boot pinned source in an isolated database; run upstream migrations; correct failing dependencies and migrations; inspect module providers and all authorization boundaries.
2. Introduce wallet ledger, payment uniqueness, orders/outbox, inventory reservations; test concurrency on the actual relational engine.
3. Adapt existing Marzban/X-UI integrations into the registry, redact logs, classify API errors; contract-test with isolated panels. Add Hiddify after verifying its deployed API version.
4. Expose shared mutation API only after payment/provisioning tests pass; route both bot and Mini App through these use cases.
5. Build mobile-first FA/EN Mini App and enable audited Filament resources; no fake server ping, balances, orders or successful payments.
6. Add digital inventory, reseller policies, renewal/notification workers; test recovery, expiry and duplicate jobs.
7. New Railway project and dedicated bot; health checks, least-privilege secrets, backup/restore drill; isolated end-to-end purchase before commercial activation.

## Telegram compatibility

Current official Bot API documents InlineKeyboardButton `style` values primary/success/danger and `icon_custom_emoji_id` before text. The prompt's statement that colors cannot be changed is outdated; arbitrary glass/CSS effects still are not available. Custom emoji use depends on the documented bot/owner eligibility. Keep Unicode fallback. https://core.telegram.org/bots/api#inlinekeyboardbutton

Mini App HMAC reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

## Acceptance gates

- Forged, stale, wrong-bot and duplicate-key initData rejected; cross-user access rejected.
- Parallel purchase cannot overspend; payment callback/receipt approval replay credits once; currency/amount validated server-side.
- Timeout after remote creation produces one service; retries do not extend expiry twice.
- Failed adapter and worker restart preserve recoverable order state.
- Persian/English flows, real QR/config delivery, administrator permissions, stock limits and reseller discounts verified.
- Fresh migration and restore from an encrypted backup tested in a separate environment.
- Dedicated Telegram bot verified; production databases/webhooks never referenced by staging.
