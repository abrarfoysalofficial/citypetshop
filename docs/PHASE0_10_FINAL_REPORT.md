# Phase 0–10 Final Report — City Plus Pet Shop

**Domain:** https://citypetshopbd.com  
**Date:** 2026-02-22  
**Status:** Production-ready (Prisma-only, no Supabase)

---

## 1. Issues Found & Fixed

### Phase 2: Supabase Removal
| File | Change |
|------|--------|
| `app/api/checkout/order/route.ts` | Removed `createOrderSupabase`; Prisma-only |
| `app/api/analytics/events/route.ts` | Removed Supabase branch; Prisma-only |
| `app/api/payment-gateways/route.ts` | Removed Supabase branch |
| `app/api/reviews/orders/route.ts` | Replaced Supabase with Prisma + `getServerSession` |
| `app/api/auth/providers/route.ts` | Returns empty (no OAuth in Prisma mode) |
| `app/auth/callback/route.ts` | Redirects to login (no Supabase OAuth) |
| `app/api/auth/demo-logout/route.ts` | Removed Supabase signOut; uses `buildRedirectUrl` |
| `app/login/LoginForm.tsx` | Removed Supabase OAuth/OTP; credentials only |
| `app/track-order/page.tsx` | Removed Supabase realtime; API + polling only |
| `app/admin/AdminDashboardClient.tsx` | Replaced Supabase with `/api/admin/dashboard` fetch |
| `src/services/auth.ts` | Removed `createSupabaseAuthService` |
| `src/data/provider.ts` | Removed `shouldUseSupabase` |

### Phase 3: /admin Redirect Fix (Critical)
| File | Change |
|------|--------|
| `lib/site-url.ts` | `getPublicBaseUrlFromRequest`, `buildRedirectUrl` |
| `middleware.ts` | All redirects use `buildRedirectUrl(request, path)` |
| `lib/auth.ts` | Redirect callback blocks localhost |

### Phase 5: About Page
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `AboutPageProfile`, `TeamMember` |
| `prisma/migrations/20260222170000_add_about_page/` | Migration |
| `app/api/admin/about-founder/route.ts` | CRUD founder |
| `app/api/admin/about-team/route.ts` | CRUD team |
| `app/api/admin/about-team/[id]/route.ts` | PATCH/DELETE team member |
| `app/api/about/route.ts` | Public API (cached 60s) |
| `app/about/page.tsx` | DB-driven with fallback defaults |
| `app/admin/about/page.tsx` | Admin UI for founder + team |

### Phase 7: TypeScript
| File | Change |
|------|--------|
| `app/api/admin/courier-settings/route.ts` | `Prisma.InputJsonValue` cast |
| `app/api/admin/dashboard-layout/route.ts` | `Prisma.InputJsonValue` cast |

### Phase 8–9: Deploy
| File | Change |
|------|--------|
| `scripts/deploy-production.sh` | Full deploy script with health checks |

---

## 2. Prisma Migrations

```bash
npx prisma migrate deploy
```

**New migration:** `20260222170000_add_about_page`
- `about_page_profiles` (id = "founder")
- `team_members`

---

## 3. Admin UI Routes Added

| Route | Purpose |
|-------|---------|
| `/admin/about` | Manage founder + team for About page |

---

## 4. Verification Commands

```bash
# Local health
curl -I http://127.0.0.1:3001/

# Public
curl -I https://citypetshopbd.com/
curl -I https://citypetshopbd.com/admin

# CRITICAL: /admin must NOT redirect to localhost
curl -sI https://citypetshopbd.com/admin | grep -i location
# Expected: Location: https://citypetshopbd.com/admin/login (or 200)
# FAIL: Location: https://localhost:3001/503
```

---

## 5. Production Deploy Steps

```bash
cd /var/www/cityplus/app
sudo -u cityplus bash scripts/deploy-production.sh
```

Or manually:
1. `git pull`
2. `npm ci`
3. `npx prisma generate && npx prisma migrate deploy`
4. `npm run build`
5. `cp -r public .next/standalone/public`
6. `cp -r .next/static .next/standalone/.next/static`
7. `pm2 reload cityplus --update-env`
8. Verify: `curl -I https://citypetshopbd.com/admin`

---

## 6. Environment (Production)

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://citypetshopbd.com
NEXTAUTH_SECRET=...
NEXT_PUBLIC_SITE_URL=https://citypetshopbd.com
UPLOAD_DIR=/var/www/cityplus/uploads
```

**Proxy:** Ensure `X-Forwarded-Host` and `X-Forwarded-Proto` are set by OpenLiteSpeed/CyberPanel.

---

## 7. Phase 4, 6, 7 (Completed)

### Phase 4: Navbar
- `components/home/MainNavbar.tsx` — Grid layout: [Logo left | Nav center | Actions right] on desktop; [Hamburger | Logo center | Cart] on mobile.

### Phase 6: Images
- `PRODUCT_PLACEHOLDER` → `/ui/product-4x3.svg` (file exists; `/products/placeholder.webp` did not)
- Updated: SafeImage, checkout, combo-offers, HomeComboBlock, TopSellerCard, lib/data.ts, api/products/by-subcategory, api/feeds/meta, prisma/seed
- `next.config.js` — Added `127.0.0.1` to `remotePatterns` for dev

### Phase 7: TypeScript
- `tsconfig.json` already has `strict: true`
- Fixed JSON casts in courier-settings, dashboard-layout (Phase 7 earlier)

---

## 8. Cleanup (Optional)

- Remove `lib/supabase/*`, `@supabase/*` from package.json when confirmed unused.
