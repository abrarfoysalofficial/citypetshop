# PR-9: Security Tightening — Audit & Execution Plan

**Status:** READ-ONLY AUDIT COMPLETE — AWAITING CONFIRM PR-9  
**Date:** 2026-02-26

---

## STEP 1 — READ-ONLY AUDIT

### A) CSP (Content Security Policy)

**Location:** `next.config.js` → `headers()` → `Content-Security-Policy` (lines 25–47)

**Current CSP:**
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://static.cloudflareinsights.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' data: https://fonts.gstatic.com
img-src 'self' data: blob: https: http://localhost
connect-src 'self' https://graph.facebook.com https://www.google-analytics.com https://vitals.vercel-insights.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Findings:**
| Directive | Current | Notes |
|-----------|---------|-------|
| `script-src` | `'unsafe-inline' 'unsafe-eval'` | Both present |
| GTM | `https://www.googletagmanager.com` | Allowed |
| FB Pixel | `https://connect.facebook.net` | Allowed |
| Cloudflare | `https://static.cloudflareinsights.com` | Allowed |
| `connect-src` | GA, FB Graph, Vercel | Tracking domains allowed |

**Inline script usage:**
- `components/AnalyticsScripts.tsx`: GTM bootstrap uses `dangerouslySetInnerHTML` with inline script (lines 40–45). This loader pushes to `dataLayer` and loads `gtm.js` from googletagmanager.com.
- Cloudflare beacon: injected via `document.createElement('script')` with `src` — external, no inline.
- **Conclusion:** GTM bootstrap requires `unsafe-inline` for `script-src`. GTM’s loaded `gtm.js` may use `eval`; `unsafe-eval` removal is feasible only if GTM/GA4 do not rely on it (needs verification).

**Middleware:** `middleware.ts` — auth, rate limiting, dev routes only. No CSP.

---

### B) Webhooks (SSLCommerz)

**File:** `app/api/webhooks/sslcommerz/route.ts`

**Current security:**
- Order Validation API: `validateSslCommerzTransaction(valId)` before marking paid
- Idempotency: `PaymentWebhookLog` by `val_id`, skip if already paid
- Amount check: `orderTotal` vs `validatedAmount` within `AMOUNT_TOLERANCE`
- Status transitions: `canTransitionPaymentStatus` (pending→paid, pending→failed, paid→refunded)
- No IP allowlist, no source IP checks

**SSLCommerz docs:** No published IP ranges for IPN. Validation is via Order Validation API with `val_id`.

**Recommendation:** Add optional IP allowlist (env-configurable). If SSLCommerz later publishes IPs, allowlist can be populated. Safe fallback: when allowlist is empty, skip IP check (current behavior).

---

### C) Request Body Limits

**Endpoints accepting large bodies:**

| Endpoint | Method | Body type | Risk | Typical size |
|----------|--------|-----------|------|--------------|
| `/api/analytics/events` | POST | JSON | Medium | &lt;2KB |
| `/api/checkout/order` | POST | JSON | Medium | &lt;50KB (many items) |
| `/api/admin/products/import` | POST | JSON + text | High | Can be MB |
| `/api/webhooks/sslcommerz` | POST | formData | Low | &lt;10KB |
| `/api/admin/settings/secure-config` | POST | JSON | Low | &lt;5KB |
| `/api/admin/upload` | POST | formData | High | File uploads |

**Current limits:**
- Next.js default: ~1MB for Server Actions; API route handlers share similar limits (body parsing).
- No explicit `bodySizeLimit` in `next.config.js`.
- No per-route or manual `Content-Length` checks.

**Next.js 14:** `serverActions.bodySizeLimit` in `next.config.js` applies to Server Actions. App Router API routes may use the same or a separate limit; per-route config is not available.

---

### D) Test OOM Reliability

**Jest config:** `jest.config.js` — minimal: `testEnvironment: "node"`, `preset: "ts-jest"`, no `runInBand`, no `maxWorkers`, no `--max-old-space-size`.

**Test count:** 17 unit test files in `tests/unit/`.

**Known mitigation (from PR-8):** `npm test -- --runInBand` if OOM.

**Root cause:** Parallel workers (default) each spawn Node processes; combined memory can exceed available RAM in CI.

**Proposed:** Add `--runInBand` and/or `--maxWorkers=2` to `package.json` test script; optionally `NODE_OPTIONS=--max-old-space-size=2048` for Jest.

---

## STEP 2 — EXECUTION PLAN (NO CODE)

### 1) CSP Rollout Strategy

**Stage 1 — Remove `unsafe-eval`**
- **Action:** Remove `'unsafe-eval'` from `script-src`.
- **Risk:** GTM/GA4 or third-party scripts may break if they use `eval()`.
- **Verification:** Smoke test storefront; confirm GTM loads, GA events fire, FB Pixel fires.
- **Rollback:** Re-add `'unsafe-eval'` in `next.config.js` and redeploy.

**Stage 2 — Reduce `unsafe-inline` (optional, only if feasible)**
- **Constraint:** GTM bootstrap in `AnalyticsScripts.tsx` uses inline script via `dangerouslySetInnerHTML`.
- **Options:** (a) Move GTM to external script file in `public/` and load via `Script src=`, or (b) Use nonce (requires middleware to inject nonce per request). Nonce adds complexity; external file is simpler.
- **Recommendation:** Defer Stage 2. Focus on Stage 1 first. Revisit after Stage 1 is stable.

**Optional — Report-only mode**
- Add `Content-Security-Policy-Report-Only` with stricter policy (e.g. no `unsafe-eval`) and `report-uri` or `report-to` to observe violations before enforcing.
- Requires reporting endpoint; can be deferred.

---

### 2) Webhook Allowlist Plan

**Design:**
- **Env var:** `SSLCOMMERZ_IP_ALLOWLIST` — comma-separated IPs or CIDRs (e.g. `1.2.3.4,5.6.7.0/24`). Empty = skip IP check (current behavior).
- **Logic:** If allowlist is set, reject requests whose `x-forwarded-for` / `x-real-ip` is not in allowlist. Return 403.
- **Fallback:** When env is unset or empty, no IP check — preserve current behavior.
- **Documentation:** Add to OPS_RUNBOOKS or env template; note that SSLCommerz does not publish IPs — allowlist is for future use or manual discovery.

---

### 3) Request Size Limits

**Global (next.config.js):**
- Add `serverActions: { bodySizeLimit: '1mb' }` (or keep default) to make limit explicit.
- Note: App Router API routes may not use this; verify behavior.

**Per-route (manual):**
- Add helper `assertBodySize(request, maxBytes)` that:
  - Reads `Content-Length` header.
  - If present and &gt; maxBytes, return 413 before calling `request.json()`.
  - If absent, optionally allow (streaming) or reject for JSON routes.
- Apply to high-risk routes:
  - `/api/analytics/events`: 64KB
  - `/api/checkout/order`: 256KB
  - `/api/admin/products/import`: 5MB (or 2MB if conservative)
  - `/api/webhooks/sslcommerz`: 64KB (formData; check `Content-Length`)
  - `/api/admin/settings/secure-config`: 32KB

**Next.js runtime:** No built-in per-route body limit for App Router. Manual `Content-Length` check is the reliable approach.

---

### 4) Test Stability Changes

**package.json `test` script:**
- **Current:** `"test": "jest"`
- **Proposed:** `"test": "jest --runInBand --maxWorkers=1"` (or `--maxWorkers=2` if 1 is too slow)
- **Alternative:** `"test": "cross-env NODE_OPTIONS=--max-old-space-size=2048 jest --runInBand"`

**CI:** Ensure same flags in CI config (e.g. GitHub Actions `npm test`).

**Split suites (optional):** If needed, add `test:unit` and `test:unit:ci` with different worker configs. Start with `--runInBand` only.

---

### 5) Verification Checklist

| Step | Command / Action |
|------|------------------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit tests | `npm test` (with new flags) |
| CSP (Stage 1) | Deploy → open storefront → DevTools Console: no CSP errors |
| GTM | DevTools Network: `gtm.js` loads; GTM preview / GA4 debug shows events |
| FB Pixel | FB Pixel Helper or Network: `connect.facebook.net` requests |
| GA | GA4 Realtime or debug view: page_view / events |
| SSLCommerz init | Place test order → redirect to SSLCommerz payment page |
| SSLCommerz webhook | Use SSLCommerz sandbox IPN or manual `curl` with valid payload (sandbox) |
| Body limit | `curl -X POST .../api/analytics/events -d @large.json` (e.g. 65KB) → expect 413 |
| Webhook allowlist | If set: `curl` from non-allowlisted IP → 403 |

**Curl checks:**
```bash
# Health
curl -sf http://localhost:3000/api/health

# CSP header present
curl -sI http://localhost:3000/ | grep -i content-security-policy

# Body limit (after implementation)
curl -X POST http://localhost:3000/api/analytics/events \
  -H "Content-Type: application/json" \
  -d "$(python -c 'print("{\"event_name\":\"x\",\"payload\":\"" + "x"*70000 + "\"}")')" \
  -w "%{http_code}"  # Expect 413
```

---

### 6) Rollback Plan

| Change | Rollback |
|--------|----------|
| CSP (remove unsafe-eval) | Re-add `'unsafe-eval'` in `next.config.js`; redeploy |
| Webhook allowlist | Unset `SSLCOMMERZ_IP_ALLOWLIST` or clear value; restart |
| Body limits | Remove `assertBodySize` calls; redeploy |
| Test script | Revert `package.json` test script to `jest` |
| Full PR-9 | Git revert PR-9 merge; redeploy; restore DB if any migration |

**Pre-deploy:** Backup DB per OPS_RUNBOOKS. No DB migrations expected for PR-9.

---

## Non-Negotiable Constraints (Verified)

| Constraint | Status |
|------------|--------|
| Must not break GTM/Meta/GA tracking | CSP keeps GTM, FB, GA domains; Stage 1 only removes unsafe-eval — verify post-deploy |
| Must not break SSLCommerz payments/webhooks | Allowlist empty = no IP check; validation API unchanged |
| Must not expose secrets | No changes to secure-config or settings exposure |
| Verification steps and rollback plan | Included above |

---

## File Impact (Proposed)

| File | Change |
|------|--------|
| `next.config.js` | CSP: remove `unsafe-eval`; optional `serverActions.bodySizeLimit` |
| `app/api/webhooks/sslcommerz/route.ts` | Optional IP allowlist check (env-driven) |
| `lib/request-utils.ts` (new) | `assertBodySize(request, maxBytes)` helper |
| `app/api/analytics/events/route.ts` | Call `assertBodySize` before `request.json` |
| `app/api/checkout/order/route.ts` | Call `assertBodySize` before `request.json` |
| `app/api/admin/products/import/route.ts` | Call `assertBodySize` before parsing |
| `app/api/webhooks/sslcommerz/route.ts` | Call `assertBodySize` before `request.formData` |
| `app/api/admin/settings/secure-config/route.ts` | Call `assertBodySize` before `request.json` |
| `package.json` | `test`: add `--runInBand` (and optionally `--maxWorkers=1`) |
| `docs/OPS_RUNBOOKS.md` | Add PR-9 verification, `SSLCOMMERZ_IP_ALLOWLIST` note |
| `.env.example` | Add `SSLCOMMERZ_IP_ALLOWLIST` (optional, commented) |

---

**STOP — Awaiting CONFIRM PR-9 before implementation.**
