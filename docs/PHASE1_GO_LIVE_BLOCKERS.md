# PHASE 1 — Go-Live Blockers Audit

**Project:** City Plus Pet Shop  
**Date:** 2025-02-21  
**Scope:** Top 30 production blockers with exact file paths  
**Status:** NO CHANGES — audit only

---

## CRITICAL (Must fix before go-live)

### 1. Demo auth mode can run in production
**File:** `middleware.ts` lines 6–9, 86–108  
**Issue:** If `NEXT_PUBLIC_AUTH_MODE` and `NEXT_PUBLIC_AUTH_SOURCE` are unset, and `NODE_ENV=production` with `DATABASE_URL` missing, AUTH_MODE falls back to `"demo"`. Anyone with `demo_session=admin` cookie gets full admin access.  
**Fix:** In production, never use demo mode. Require explicit `NEXT_PUBLIC_AUTH_MODE=prisma` (or supabase). If AUTH_MODE would be demo in production, return 503 or redirect to error page.

### 2. OTP send always returns `sent: true` regardless of SMS success
**File:** `app/api/track-order/send-otp/route.ts` line 93  
**Issue:** Response is always `{ sent: true }` even when Twilio and webhook both fail. Users may believe OTP was sent when it was not.  
**Fix:** Return `{ sent: sent }` so client reflects actual send status.

### 3. OTP verify returns demo-token when DATABASE_URL is missing
**File:** `app/api/track-order/verify-otp/route.ts` lines 25–27  
**Issue:** Without DB, returns `{ token: "demo-token" }`, allowing anyone to bypass OTP and view orders.  
**Fix:** Return 503 when `DATABASE_URL` is missing in production instead of issuing demo token.

### 4. Track-order does not enforce requireOtpPhoneTracking
**File:** `app/api/track-order/route.ts`  
**Issue:** `requireOtpPhoneTracking` from SiteSettings is not enforced. Phone-based lookups can expose orders without OTP verification. `otp_token` is read but not validated against `TrackVerifiedToken`.  
**Fix:** When `requireOtpPhoneTracking` is true and query is by phone, require valid `otp_token` from `TrackVerifiedToken` before returning orders.

### 5. Admin reviews route has no auth
**File:** `app/api/admin/reviews/route.ts` (entire file)  
**Issue:** No `requireAdminAuth`. Uses Supabase directly. Anyone can PATCH to approve/reject reviews.  
**Fix:** Add `requireAdminAuth()` at the start of the PATCH handler. Add Prisma path when using Prisma.

### 6. Admin courier-booking route has no auth
**File:** `app/api/admin/courier-booking/route.ts` (entire file)  
**Issue:** No `requireAdminAuth`. Anyone can POST to book couriers.  
**Fix:** Add `requireAdminAuth()` at the start of the POST handler.

### 7. Reviews API uses hardcoded `demo-user` for auth
**File:** `app/api/reviews/route.ts` lines 18–20  
**Issue:** `getUserId` always returns `"demo-user"`. No real session check. Anyone can submit reviews as demo-user.  
**Fix:** Use NextAuth session and return real `userId`; return 401 when unauthenticated.

### 8. Seed uses default admin password in production
**File:** `prisma/seed.ts` lines 11–12  
**Issue:** `ADMIN_PASSWORD` defaults to `"Admin@12345"`. In production this is insecure.  
**Fix:** In production, require `ADMIN_PASSWORD` and enforce minimum 12 chars. Fail seed if default is used when `NODE_ENV=production`.

---

## HIGH (Fix before handover)

### 9. NEXTAUTH_SECRET not validated in production
**Files:** `middleware.ts` line 23, `lib/auth.ts` line 58  
**Issue:** If `NEXTAUTH_SECRET` is missing, JWT signing can fail or use weak defaults.  
**Fix:** Add startup check: if `NODE_ENV=production` and `!process.env.NEXTAUTH_SECRET`, log error and exit or return 503 on auth routes.

### 10. OTP send has no rate limiting
**File:** `app/api/track-order/send-otp/route.ts`  
**Issue:** No rate limit on OTP requests. Risk of SMS abuse and cost.  
**Fix:** Add rate limit (e.g. 3 OTPs per phone per 15 min, 10 per IP per hour). Return 429 with `Retry-After` when exceeded.

### 11. Sitemap uses static lib/data instead of Prisma
**File:** `app/sitemap.xml/route.ts` lines 2, 29–31  
**Issue:** Uses `categories` and `products` from `lib/data` (static IDs 1–20). Real products use UUID slugs. Sitemap will have wrong URLs (e.g. `/product/1` instead of `/product/real-uuid`).  
**Fix:** Use provider or Prisma to fetch products/categories and build URLs from real slugs.

### 12. ProductsContext and CategoriesContext use static lib/data
**Files:** `context/ProductsContext.tsx` line 5, `context/CategoriesContext.tsx` line 5  
**Issue:** Initial state comes from `lib/data` (static products/categories). Can show stale or wrong data if provider fails.  
**Fix:** Confirm data flow. If storefront uses these for fallback, ensure provider/Prisma is primary and lib/data is dev-only.

### 13. Resend package installed but never used
**Files:** `package.json`, `.env.local.example` line 14  
**Issue:** `resend` is installed and `RESEND_API_KEY` is documented for order confirmations/invoices, but no code sends emails.  
**Fix:** Implement order confirmation and invoice emails via Resend, or remove the dependency and env var.

### 14. Env vars vs runtime config mismatch
**Files:** `.env.production.example` lines 11–12, `src/config/runtime.ts`  
**Issue:** Env vars `NEXT_PUBLIC_PRODUCTS_SOURCE` and `NEXT_PUBLIC_AUTH_SOURCE` suggest build-time config, but `runtime.ts` hardcodes `DATA_SOURCE = "prisma"` and `AUTH_MODE = "prisma"`. Middleware uses `process.env` directly, not runtime.ts.  
**Fix:** Align middleware with runtime.ts or document that env vars override runtime.

### 15. Checkout settings Supabase fallback may be dead code
**File:** `app/api/checkout/settings/route.ts` lines 36–38  
**Issue:** When Prisma is configured, uses Prisma. When not, checks Supabase. If both are configured, behavior depends on `isPrismaConfigured()`. Supabase fallback may be dead when using Prisma-only.  
**Fix:** Simplify to Prisma-only when `DATA_SOURCE=prisma`; remove Supabase fallback if not used.

---

## MEDIUM (Fix or document)

### 16. Dashboard revenueChange is TODO
**File:** `app/api/admin/dashboard/route.ts` line 87  
**Issue:** `revenueChange: 0` with TODO to calculate from previous period.  
**Fix:** Implement period-over-period revenue change or remove from response.

### 17. RBAC audit log missing IP and user agent
**File:** `lib/rbac.ts` lines 152–153  
**Issue:** `ipAddress: null`, `userAgent: null` with TODO to get from request.  
**Fix:** Pass request into audit logging and set `ipAddress` and `userAgent`.

### 18. Invoice download is mock
**Files:** `app/account/orders/[id]/page.tsx` line 49, `app/account/invoices/page.tsx` lines 11, 35  
**Issue:** "Download invoice (mock PDF)" and "Download PDF (mock)" – no real PDF generation.  
**Fix:** Implement PDF generation (e.g. with `pdf-lib`) or hide until ready.

### 19. Admin order page has mock actions
**File:** `app/admin/orders/[id]/page.tsx` lines 59–60  
**Issue:** "Print invoice (mock)" and "Courier booking (mock)" – no real implementation.  
**Fix:** Implement or hide until ready.

### 20. provider-db uses /placeholder.jpg fallbacks
**File:** `src/data/provider-db.ts`  
**Issue:** Multiple fallbacks to `/placeholder.jpg` when images are missing. Ensure asset exists.  
**Fix:** Use shared placeholder constant; ensure `/products/placeholder.webp` or equivalent exists in public.

### 21. lib/data is static fallback
**File:** `lib/data.ts` lines 52–234  
**Issue:** Static product list with placeholder images. Imported by sitemap and contexts.  
**Fix:** Use only for dev/fallback; ensure production uses Prisma/provider.

### 22. DATABASE_URL required for build
**File:** `prisma/schema.prisma` line 10  
**Issue:** Prisma needs `DATABASE_URL` at build time for `prisma generate`. Build can fail without it.  
**Fix:** Document that `DATABASE_URL` must be set before build, or use dummy URL for build.

### 23. UPLOAD_DIR default may not exist
**Files:** `app/api/admin/upload/route.ts` line 8, `lib/storage-local.ts` line 8  
**Issue:** Default `/var/www/city-plus/uploads` may not exist on the server.  
**Fix:** Create directory in deployment steps or on first upload.

### 24. MinIO defaults to local Docker
**File:** `lib/storage.ts` lines 8–16  
**Issue:** Defaults to `minio:9000`, `minioadmin` credentials. Not suitable for production.  
**Fix:** Require explicit MinIO/S3 config in production; fail or warn if defaults are used.

### 25. SSLCommerz webhook has no IP allowlist
**File:** `app/api/webhooks/sslcommerz/route.ts`  
**Issue:** Webhook is public. Validation API mitigates forgery, but IP allowlist would add defense.  
**Fix:** Optionally restrict to SSLCommerz IP ranges if documented.

### 26. Checkout order API has no rate limiting
**File:** `app/api/checkout/order/route.ts`  
**Issue:** No rate limit on order creation. Risk of DoS and abuse.  
**Fix:** Add rate limit (e.g. 5 orders per IP per minute).

### 27. Admin login has no rate limiting
**Files:** `app/api/auth/[...nextauth]/route.ts`, `app/admin/login/page.tsx`  
**Issue:** No rate limit on admin login attempts. Brute-force risk.  
**Fix:** Add rate limit (e.g. 5 attempts per IP per 15 min).

### 28. Sitemap page uses lib/data
**File:** `app/sitemap/page.tsx` line 2  
**Issue:** Same as #11 – uses static data for sitemap.  
**Fix:** Use Prisma/provider for products and categories.

### 29. FeaturedProducts uses lib/data
**File:** `components/FeaturedProducts.tsx` line 5  
**Issue:** Uses `featuredProductIds` from lib/data.  
**Fix:** Use provider/Prisma for featured products.

### 30. Admin bulk import uses lib/data
**File:** `app/admin/products/bulk/page.tsx` line 7  
**Issue:** Uses `categories` from lib/data for bulk import.  
**Fix:** Fetch categories from API/Prisma.

---

## Summary Table

| # | Severity | Blocker |
|---|----------|---------|
| 1–8 | Critical | Auth bypass, OTP/SMS issues, unprotected admin APIs, fake auth, default secrets |
| 9–15 | High | Auth config, rate limits, sitemap/data source, email integration |
| 16–30 | Medium | TODOs, mocks, placeholders, rate limits, deployment config |

---

## Recommended Fix Order

1. **Auth and security (1, 5, 6, 7, 8, 9)** – prevent unauthorized access  
2. **OTP flow (2, 3, 4, 10)** – fix send/verify and enforce OTP when required  
3. **Data sources (11, 12, 14, 28, 29, 30)** – align sitemap and contexts with Prisma  
4. **Email (13)** – implement or remove Resend  
5. **Mocks and placeholders (18, 19)** – implement or hide  
6. **Rate limits (10, 26, 27)** – add to OTP, checkout, and admin login  
7. **Deployment (22, 23, 24)** – document and harden

---

## Next Phase

Proceed to **PHASE 2 — FIX BLOCKERS** with safe patches in small commits.
