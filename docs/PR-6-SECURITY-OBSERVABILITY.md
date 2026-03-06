# PR-6 — Security & Observability Hardening

**Date:** 2026-02-26  
**Status:** Implemented  
**Environment:** Single Node, Redis, systemd/OpenLiteSpeed

---

## Scope

1. Redis-backed rate limiter (fallback to in-memory when Redis unavailable)
2. Replace `console.*` with `lib/logger.ts` in invoice, dashboard, SSLCommerz webhook
3. Optimize dashboard aggregation (SQL-level monthly aggregation)
4. Remove silent failures (`.catch(() => {})` → logger)

---

## Files Changed

| File | Change |
|------|--------|
| `lib/redis.ts` | **New** — Redis client, lazy connect, fallback-safe |
| `lib/rate-limit.ts` | **Rewritten** — Redis INCR+EXPIRE, `rateLimit` async, `rateLimitSync` for Edge |
| `middleware.ts` | Use `rateLimitSync` (Edge runtime cannot use Redis) |
| `app/api/analytics/events/route.ts` | Rate limit 60 req/min per IP, logger |
| `app/api/checkout/order/route.ts` | `await rateLimit` (async) |
| `app/api/track-order/send-otp/route.ts` | `await rateLimit` (async) |
| `app/api/invoice/route.ts` | Replace `console.error` with `logError` |
| `app/api/admin/dashboard/route.ts` | Replace `console.error` with `logError`, SQL monthly aggregation |
| `app/api/webhooks/sslcommerz/route.ts` | Replace `console.warn` with `logWarn`, `.catch` → logger (P2002 ignored) |
| `tests/unit/checkout-notification.test.ts` | `rateLimit` mock: `mockResolvedValue` (async) |
| `.env.production.example` | Add optional `REDIS_URL` |

---

## Environment

```env
# Optional — rate limiting; fallback to in-memory if unset
REDIS_URL=redis://127.0.0.1:6379
```

---

## Security Impact Summary

| Area | Before | After |
|------|--------|-------|
| **Analytics API** | Unrate-limited, spammable | 60 req/min per IP |
| **Rate limiter** | In-memory only, lost on restart | Redis-backed (persistent across restarts) |
| **Middleware** | In-memory (Edge runtime) | Unchanged — Edge cannot use Redis |
| **Logging** | `console.*` (unstructured, PII risk) | Structured logger, PII stripped |
| **Silent failures** | Webhook `.catch(() => {})` | Log non-P2002 errors |
| **Dashboard** | Heavy `groupBy(createdAt)` per row | SQL `date_trunc` monthly aggregation |

---

## Verification

- `npm run typecheck` — pass
- `npm run lint` — pass
- `npm test` (checkout-notification) — pass
