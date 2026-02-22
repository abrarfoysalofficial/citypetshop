# Go-Live Readiness Report

**Project:** City Plus Pet Shop  
**Date:** 2025-02-21  
**Scope:** Production hardening – top 20 risks with file paths and fix plans

---

## Top 20 Production Risks

### 1. SSLCommerz IPN has no signature verification
**Risk:** Malicious actor can forge IPN POSTs and mark orders as paid without real payment.  
**Files:** `app/api/webhooks/sslcommerz/route.ts`  
**Fix plan:** Call SSLCommerz Order Validation API (`/validator/api/validationserverAPI.php`) with `val_id`, `store_id`, `store_passwd` to verify transaction before updating. Reject IPN if validation fails.

---

### 2. SSLCommerz IPN has no idempotency – double-paid possible
**Risk:** Webhook replay or duplicate IPN can update `payment_status` multiple times; race conditions on concurrent IPNs.  
**Files:** `app/api/webhooks/sslcommerz/route.ts`  
**Fix plan:** Before updating, check `order.paymentStatus === "paid"` – if already paid, return 200 without re-updating. Add `PaymentWebhookLog` table with `(orderId, valId, status, receivedAt)` and skip if `valId` already processed.

---

### 3. Amount mismatch in IPN only logs, does not reject
**Risk:** IPN with wrong amount could mark order paid; currently only `console.warn`.  
**Files:** `app/api/webhooks/sslcommerz/route.ts` (lines 34–37)  
**Fix plan:** If `Math.abs(orderTotal - paidAmount) > 0.01`, return 400 and do NOT update payment status. Log for investigation.

---

### 4. Payment success page trusts client without server verification
**Risk:** User can visit `/payment/success?orderId=X` without paying; UI shows "Payment Successful".  
**Files:** `app/payment/success/page.tsx`  
**Fix plan:** Create API `GET /api/checkout/order/[id]/payment-status` that returns `{ paid: boolean }` from DB. Success page fetches this and shows "Processing..." or "Failed" if not paid. Or make success page server component that reads order from DB.

---

### 5. No strict payment_status/order_status transition validation
**Risk:** Admin or bug could set `payment_status: paid` on cancelled order, or `status: delivered` while payment pending.  
**Files:** `app/api/webhooks/sslcommerz/route.ts`, `app/api/admin/orders/` (any status update)  
**Fix plan:** Add `lib/order-transitions.ts` with allowed transitions (e.g. `pending→paid` only via webhook; `paid` orders cannot go to `cancelled` without refund flow). Enforce in webhook and admin order update APIs.

---

### 6. OTP send has no rate limiting
**Risk:** SMS bombing, cost abuse, phone enumeration.  
**Files:** `app/api/track-order/send-otp/route.ts`  
**Fix plan:** Add in-memory or Redis rate limit: max 3 OTPs per phone per 15 min, max 10 per IP per hour. Return 429 with Retry-After header when exceeded.

---

### 7. Demo auth mode can run in production
**Risk:** If `DATABASE_URL` unset or `NEXT_PUBLIC_AUTH_MODE` misconfigured, middleware falls back to demo mode; anyone with `demo_session=admin` cookie gets admin access.  
**Files:** `middleware.ts` (lines 6–9, 86–108)  
**Fix plan:** In production (`NODE_ENV=production`), never use demo mode. If `AUTH_MODE` would be demo, fail fast: redirect to error page or return 503. Require explicit `NEXT_PUBLIC_AUTH_MODE=prisma` (or supabase) in production.

---

### 8. NEXTAUTH_SECRET can be missing in production
**Risk:** JWT signing fails or uses weak default; session hijacking.  
**Files:** `middleware.ts` (line 23), `lib/auth.ts` (line 58)  
**Fix plan:** Add startup check: if `NODE_ENV=production` and `!process.env.NEXTAUTH_SECRET`, log error and exit or return 503 on auth routes. Document in `.env.production.example`.

---

### 9. No backup or restore procedure
**Risk:** Data loss with no recovery path.  
**Files:** None (no backup scripts)  
**Fix plan:** Add `scripts/backup.sh` (pg_dump + optional media tar), `scripts/restore-to-staging.sh`, retention policy (e.g. 7 daily). Document in runbook.

---

### 10. Media uploads not backed up
**Risk:** Product images, logos lost if disk fails.  
**Files:** `lib/storage-local.ts`, `app/api/admin/upload/route.ts` – `UPLOAD_DIR`  
**Fix plan:** Include `UPLOAD_DIR` in backup script. If using MinIO/S3, enable versioning and lifecycle; document restore from object storage.

---

### 11. Fraud thresholds hardcoded
**Risk:** Cannot tune block/OTP/review without code deploy.  
**Files:** `lib/fraud.ts` (lines 53–56, 64–67, 70–71: `>= 3` orders, `>= 70` risk, `score < 60` pass)  
**Fix plan:** Add `FraudPolicy` table (or `site_settings` JSON) with `blockThreshold`, `otpThreshold`, `manualReviewThreshold`, `phoneVelocityLimit`, `phoneVelocityHours`. Read from DB in `checkFraud`.

---

### 12. No admin review queue for flagged orders
**Risk:** Flagged-but-passed orders are only logged; no human review workflow.  
**Files:** `lib/fraud.ts`, `app/admin/fraud/page.tsx` – shows flags but no "review queue" or actions  
**Fix plan:** Add `FraudFlag.reviewStatus` (pending|approved|rejected), `reviewedBy`, `reviewedAt`. Admin API `PATCH /api/admin/fraud/flags/[id]` to approve/reject. UI: list orders with `reviewStatus=pending`, allow approve/reject.

---

### 13. Checkout order API has no rate limiting
**Risk:** DoS, card testing, inventory exhaustion.  
**Files:** `app/api/checkout/order/route.ts`  
**Fix plan:** Rate limit: e.g. 5 orders per IP per minute, 20 per hour. Use middleware or `lib/rate-limit.ts` with in-memory/Redis store.

---

### 14. Admin login has no rate limiting
**Risk:** Brute force on admin credentials.  
**Files:** `app/api/auth/[...nextauth]/route.ts`, `app/admin/login/page.tsx`  
**Fix plan:** Rate limit login attempts: 5 per IP per 15 min. NextAuth Credentials provider can integrate with rate limiter before `authorize`.

---

### 15. Webhook URL is guessable and unauthenticated
**Risk:** IPN URL `/api/webhooks/sslcommerz` is public; no shared secret validation.  
**Files:** `app/api/webhooks/sslcommerz/route.ts`  
**Fix plan:** SSLCommerz does not send HMAC in IPN; validation must be done via Order Validation API (risk #1). Optionally add `X-Webhook-Secret` header check if SSLCommerz supports it; otherwise rely on validation API.

---

### 16. Prisma client used without DATABASE_URL check in some paths
**Risk:** 500 errors if DB unreachable; no graceful degradation.  
**Files:** `app/api/webhooks/sslcommerz/route.ts`, `app/api/checkout/order/route.ts` – use prisma when `isPrismaConfigured()`  
**Fix plan:** Webhook and checkout already gate on config. Add health check that fails if `DATABASE_URL` set but DB unreachable. Ensure all critical APIs return 503 with clear message when DB down.

---

### 17. Sensitive env vars in example files
**Risk:** `.env.production.example` or docs may leak patterns; default admin password in seed.  
**Files:** `prisma/seed.ts` (line 12: `Admin@12345`), `.env.production.example`  
**Fix plan:** Seed must require `ADMIN_PASSWORD` in production (min 12 chars). Fail seed if `NODE_ENV=production` and `ADMIN_PASSWORD` is default. Document that example values must be changed.

---

### 18. No CSRF protection on state-changing APIs
**Risk:** Cross-site request forgery on checkout, admin actions.  
**Files:** `app/api/checkout/order/route.ts`, admin APIs  
**Fix plan:** Next.js App Router + SameSite cookies mitigate. For extra safety, add `Origin`/`Referer` check on POST/PATCH/DELETE: reject if origin not in allowlist (same-origin or trusted domain).

---

### 19. Error messages may leak internals
**Risk:** `err.message` or stack in API responses.  
**Files:** `app/api/checkout/order/route.ts` (line 186), various catch blocks  
**Fix plan:** In production, never return `err.message` to client. Log full error server-side; return generic "An error occurred" or "Service temporarily unavailable".

---

### 20. No webhook replay test
**Risk:** Changes to webhook logic can break payment flow; no automated verification.  
**Files:** `app/api/webhooks/sslcommerz/route.ts`  
**Fix plan:** Add Jest test that mocks Prisma and SSLCommerz validation API; sends VALID, FAILED, CANCELLED IPN payloads; asserts correct `paymentStatus` updates and idempotency on replay.

---

## Summary Table

| # | Risk | Severity | Effort |
|---|------|----------|--------|
| 1 | IPN no signature/validation | Critical | Medium |
| 2 | IPN no idempotency | Critical | Low |
| 3 | Amount mismatch not rejected | High | Low |
| 4 | Success page not verified | High | Low |
| 5 | No status transition rules | Medium | Medium |
| 6 | OTP no rate limit | High | Medium |
| 7 | Demo mode in prod | Critical | Low |
| 8 | NEXTAUTH_SECRET missing | Critical | Low |
| 9 | No backup procedure | High | Medium |
| 10 | Media not backed up | Medium | Low |
| 11 | Fraud thresholds hardcoded | Medium | Medium |
| 12 | No fraud review queue | Medium | Medium |
| 13 | Checkout no rate limit | Medium | Medium |
| 14 | Admin login no rate limit | High | Medium |
| 15 | Webhook unauthenticated | Mitigated by #1 | - |
| 16 | DB down handling | Medium | Low |
| 17 | Default secrets in seed | High | Low |
| 18 | CSRF | Low | Low |
| 19 | Error message leakage | Low | Low |
| 20 | No webhook tests | Medium | Medium |

---

## Recommended Implementation Order

1. **Payment hardening** (1, 2, 3, 4, 5, 20) – prevents financial loss  
2. **Auth hardening** (7, 8, 14, 17) – prevents unauthorized access  
3. **Backup + restore** (9, 10) – enables recovery  
4. **Fraud policy** (11, 12) – operational flexibility  
5. **Rate limits** (6, 13) – abuse prevention  
6. **Misc** (16, 18, 19)

---

## Implemented (Production Hardening)

| # | Risk | Status | Files |
|---|------|--------|-------|
| 1 | IPN validation | Done | `lib/sslcommerz-validate.ts`, `app/api/webhooks/sslcommerz/route.ts` |
| 2 | Idempotency | Done | `PaymentWebhookLog`, webhook route |
| 3 | Amount reject | Done | Webhook returns 400 on mismatch |
| 4 | Success page verify | Done | `app/payment/success/page.tsx`, `app/api/checkout/order/[id]/payment-status/route.ts` |
| 5 | Status transitions | Done | `lib/order-transitions.ts` |
| 9, 10 | Backup + restore | Done | `scripts/backup.sh`, `scripts/restore-to-staging.sh`, `docs/BACKUP_RESTORE_RUNBOOK.md` |
| 11, 12 | Fraud policy + review | Done | `FraudPolicy`, `lib/fraud.ts`, `app/api/admin/fraud/policy`, `app/api/admin/fraud/review`, `app/api/admin/fraud/flags/[id]` |
| 20 | Webhook tests | Done | `__tests__/webhook-sslcommerz.test.ts`, `__tests__/fraud.test.ts` |

### Verification commands
```bash
# Run migrations
npx prisma migrate deploy

# Run tests (if Jest deps fixed)
npm test

# Backup (Linux/Mac)
./scripts/backup.sh 7

# Backup (Windows)
.\scripts\backup.ps1 -RetentionDays 7
```
