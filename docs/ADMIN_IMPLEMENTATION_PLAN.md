# Admin Panel Implementation Plan – Zero Loss, Supabase Live

## Goals
1. Ecommerce-style admin UI (sidebar, nested menus, logout block)
2. Admin fully Supabase-live (no demo for admin)
3. Zero loss of existing features, routes, providers
4. Fix "Service temporarily unavailable" on Settings/Checkout-Settings/Products

---

## Step-by-Step Plan

### Step 1: Expand Sidebar Config (lib/admin-config.ts)
- Add ALL admin routes from A–Z summary
- Primary nav: Dashboard, Home Banner Slides, Category, Products (collapsible), Orders, Home Banners, Home Side Banners, Home Bottom Banners
- Secondary/collapsible "More" section: Settings, Checkout Settings, Payments, Analytics, Blog, etc.
- Keep reference structure; add legacy routes in expandable "More" group

### Step 2: Admin Settings API – Supabase Adapter
- Refactor `/api/admin/settings` to use Supabase directly (bypass provider for admin)
- GET: fetch from site_settings; if null, return DEMO_SITE_SETTINGS as form defaults (structure only)
- PATCH: update site_settings; remove isDemoAuth check (admin is Supabase-only)
- Add `export const dynamic = "force-dynamic"`

### Step 3: Upload API – Support store-assets Bucket
- Add `store-assets` to allowed buckets for logo/settings uploads
- Storage migration for store-assets if needed

### Step 4: Route Aliases (next.config.js)
- `/admin/products/new` → `/admin/products/upload` (permanent: false)

### Step 5: Admin Layout – Dynamic Config
- Ensure `app/admin/layout.tsx` exports `dynamic = "force-dynamic"` (already done)
- Add "More" section to sidebar for legacy routes

### Step 6: Fix Payment Gateways / Dashboard Layout APIs
- Same pattern: use Supabase directly for admin, remove demo branches
- Return defaults when Supabase returns empty (for UI compatibility)

### Step 7: Verification
- Build passes
- Admin login → Dashboard, Settings, Checkout Settings, Products all load
- Storefront unchanged

---

## Files to Create/Modify

| File | Action |
|------|--------|
| lib/admin-config.ts | Expand sidebar with all routes |
| app/admin/AdminLayout.tsx | Support expanded nav (optional "More" section) |
| app/api/admin/settings/route.ts | Supabase direct, remove demo branch |
| app/api/admin/upload/route.ts | Add store-assets bucket |
| next.config.js | Add redirect products/new → products/upload |
| app/api/admin/payment-gateways/route.ts | Supabase direct |
| app/api/admin/dashboard-layout/route.ts | Supabase direct |

---

## Non-Negotiable Preserved
- DATA_SOURCE: local | supabase | sanity
- AUTH_MODE: demo | supabase
- All storefront routes
- Sanity Studio /studio
- Provider, contexts, types
- All existing admin page files (no deletions)
