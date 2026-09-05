# Persian VPN Market Pro

Development foundation based on VPNMarket. **Not a completed product and not enabled for commercial use.**

This directory is isolated from the existing Persian Shop Python application. No existing application's source, database, variables, bot webhook, domain, or deployment is modified. Development branch: `feature/persian-vpn-market-pro`.

## Reproducible upstream reuse

`upstream.lock.json` pins the reviewed VPNMarket commit. `prepare.py` checks out that exact revision and applies a small, reviewable overlay. Upstream Laravel, models, migrations, Filament resources, bot, services, and assets are retained in the materialized checkout; they are not reimplemented. Read the upstream README's MIT declaration and retain its attribution. An explicit license notice should be confirmed before redistribution.

```sh
python3 platform/persian-vpn-market-pro/prepare.py /tmp/persian-vpn-market-pro
php platform/persian-vpn-market-pro/tests/security.php /tmp/persian-vpn-market-pro
cd /tmp/persian-vpn-market-pro
composer install --no-interaction --prefer-dist
```

PHP 8.3+ is required by the reviewed composer manifest. Use the upstream lock file. Do not run its root installer, database dumps, updater or shell backup utilities automatically.

## Implemented in this change

- Exact upstream provenance and repeatable preparation.
- Strict Telegram HMAC validation with expiry, duplicate-field rejection, identity validation, and constant-time comparison.
- Replacement of the insecure Mini App middleware; no unsigned `user_id` fallback, no cookie identity bypass, no client-driven account creation.
- Read-only `/api/v1/account` and `/api/v1/plans` endpoints sharing upstream User, Order and Plan records; allowlisted response fields, rate limiting, no-store headers.
- Panel adapter contract, normalized service snapshot, and extensible registry. No panel is falsely advertised as integrated or tested.
- Webhook-secret middleware prepared for the future bot endpoint; not yet wired to an enabled bot route.
- Environment-based custom emoji IDs; no invented IDs or tokens.
- A restrictive development route/provider configuration while the upstream financial and admin paths are audited.
- Executable security regression checks and isolated CI workflow.

## Not implemented / not verified

No finished Mini App UI, production bot integration, safe payment or wallet engine, transactional outbox, automatic delivery, renewals, live adapters, digital store extension, reseller pricing extension, production Filament activation, backup/restore verification, or Railway deployment is claimed by this change. Upstream code provides reusable implementations for several of these, but they require integration and validation.

Sales, upstream module routes, admin providers, scheduler, and webhooks are deliberately not exposed. `/` reports development status; it is not a shop preview. Enabling providers/routes must follow the review and tests described in ARCHITECTURE.md.

## Deployment isolation

Use a new Railway project named `Persian VPN Market Pro`, a separate database and Redis, and separate web/worker/scheduler services sourced only from this branch. Do not reuse Persian-Shop production variables or its Telegram token. A branch alone does not isolate a database or Telegram webhook.

Required future secrets: a dedicated bot token, webhook secret, Laravel APP_KEY, separate database credentials, and test-panel credentials. Enter them in the new environment's secret settings, never commit them. The bot token in upstream Settings must match the Mini App validation token.

No deployment is performed by this foundation. A full Laravel boot/migration test and payment/provisioning acceptance tests remain required.
