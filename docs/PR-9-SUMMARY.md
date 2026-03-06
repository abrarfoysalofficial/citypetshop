# PR-9: Security Tightening — Summary

**Status:** Complete  
**Date:** 2026-02-26

---

## Summary

PR-9 implements security hardening for live production: CSP Stage 1 (remove unsafe-eval with env rollback), SSLCommerz webhook IP allowlist (optional), request body size limits, and CI test stability.

---

## File List

| File | Change |
|------|--------|
| `next.config.js` | CSP: env toggle `CSP_ALLOW_UNSAFE_EVAL` (default: remove unsafe-eval) |
| `lib/request-utils.ts` | New: `assertBodySize(request, maxBytes)` → 413 when exceeded |
| `app/api/webhooks/sslcommerz/route.ts` | Body limit 128KB; optional IP allowlist (CF-Connecting-IP, X-Forwarded-For, X-Real-IP) |
| `app/api/analytics/events/route.ts` | Body limit 64KB |
| `app/api/checkout/order/route.ts` | Body limit 256KB |
| `app/api/admin/settings/secure-config/route.ts` | Body limit 16KB |
| `app/api/admin/products/import/route.ts` | Body limit 2MB (env `IMPORT_BODY_LIMIT_BYTES` override, max 10MB) |
| `package.json` | `test:ci`: jest --runInBand |
| `tests/unit/request-utils.test.ts` | New: assertBodySize tests |
| `tests/unit/webhook-allowlist.test.ts` | New: IP allowlist 403, body 413 tests |
| `docs/OPS_RUNBOOKS.md` | PR-9 verification, env vars, rollback |
| `docs/PR-9-SUMMARY.md` | This file |

---

## Security Impact

| Change | Impact |
|--------|--------|
| CSP remove unsafe-eval | Reduces XSS surface; GTM/GA/FB may use eval — verify tracking post-deploy |
| CSP rollback toggle | `CSP_ALLOW_UNSAFE_EVAL=true` restores unsafe-eval if needed |
| Webhook IP allowlist | Optional; when set, only listed IPs can hit webhook (SSLCommerz does not publish IPs) |
| Body size limits | Mitigates large-payload DoS; 413 before parsing |
| test:ci | Stable CI runs (runInBand avoids OOM) |

---

## Env Vars

| Var | Default | Purpose |
|-----|---------|---------|
| `CSP_ALLOW_UNSAFE_EVAL` | unset (false) | Set `true` to restore unsafe-eval in CSP (rollback) |
| `SSLCOMMERZ_IP_ALLOWLIST` | unset | Comma-separated IPs; if set, only these IPs allowed for webhook |
| `IMPORT_BODY_LIMIT_BYTES` | 2097152 (2MB) | Max body for /api/admin/products/import (max 10MB) |

---

## Verification Checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:ci`
- [ ] `curl -sI http://localhost:3000/ | grep -i content-security-policy` — no `unsafe-eval` when `CSP_ALLOW_UNSAFE_EVAL` unset
- [ ] `curl -X POST http://localhost:3000/api/analytics/events -H "Content-Type: application/json" -H "Content-Length: 70000" -d '{"event_name":"x"}'` — expect 413
- [ ] Storefront: open, add-to-cart, checkout flow
- [ ] SSLCommerz sandbox: place order, complete payment, verify webhook (if available)
- [ ] GTM/GA/FB: DevTools Network, confirm tracking scripts load and events fire

---

## Rollback Steps

| Change | Rollback |
|--------|----------|
| CSP (unsafe-eval removed) | Set `CSP_ALLOW_UNSAFE_EVAL=true`, rebuild, redeploy |
| Webhook allowlist | Unset `SSLCOMMERZ_IP_ALLOWLIST`, restart |
| Body limits | Revert `lib/request-utils.ts` and route changes; redeploy |
| Full PR-9 | `git revert <merge-commit>`, rebuild, redeploy |

---

## Next Phase

PR-9 is complete. Consider:
- CSP Stage 2: reduce unsafe-inline (nonce or external GTM script) — only if feasible
- Report-only CSP for one deploy cycle to observe violations
