# PR-8: Performance & Caching — Read-Only Audit & Execution Plan

**Status:** AWAITING CONFIRMATION  
**Date:** 2026-02-26

---

## STEP 1 — READ-ONLY AUDIT

### A) Routes/Pages Using Dynamic/Cache Controls

#### `export const dynamic = "force-dynamic"`
**Storefront pages (all force-dynamic):**
- `app/page.tsx` — Home (also has `revalidate = 120` — **conflict**: force-dynamic wins, revalidate ignored)
- `app/shop/page.tsx` — Shop (also has `revalidate = 300` — **conflict**)
- `app/product/[id]/page.tsx` — Product detail
- `app/category/[...slug]/page.tsx` — Category pages
- `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`
- `app/combo-offers/page.tsx`
- `app/landing/[slug]/page.tsx`

**Account/Admin (correctly force-dynamic):**
- `app/account/*`, `app/admin/*`, `app/admin/orders/[id]/page.tsx`, etc.

**API routes:** ~90+ routes use `force-dynamic` (auth, checkout, admin, webhooks, feeds, sitemap, etc.)

#### `revalidate` (page-level)
- `app/page.tsx`: `revalidate = 120` (ignored due to force-dynamic)
- `app/shop/page.tsx`: `revalidate = 300` (ignored due to force-dynamic)
- `app/api/settings/sales-top-bar/route.ts`: `revalidate = 60` (conflicts with force-dynamic)

#### `no-store` / `cache: "no-store"`
- **next.config.js** applies `Cache-Control: no-store, no-cache, must-revalidate` to **all** `/api/*` except `/api/feeds/*`
- No explicit `cache: "no-store"` in fetch calls found in audit

#### `unstable_noStore` / `noStore`
- **None found** in codebase

---

### B) Caching Strategy by Surface

| Surface | Current | Notes |
|---------|---------|-------|
| **Home** | force-dynamic + revalidate=120 (ignored) | 6 parallel DB calls: getStorefrontSettings, getHomeData, getFeaturedProducts, getFlashSaleProducts, getClearanceProducts, getComboOffers |
| **Shop** | force-dynamic + revalidate=300 (ignored) | getProducts() — full product list, no pagination at DB level |
| **Product detail** | force-dynamic | getProductById + getRecommendedProducts (2 calls) |
| **Category** | force-dynamic | getProducts() then client-side filter by category — **inefficient** |
| **Search** | Client-side | ShopClient filters products in-memory; no server search API |
| **Settings** | force-dynamic | `/api/settings` sets Cache-Control: 60s but config overrides to no-store for non-feeds |
| **Feeds** | force-dynamic | Meta/Google feeds: Cache-Control 1h + SWR 2h in response; next.config also adds cache for /api/feeds/* |
| **Sitemap** | force-dynamic | `/sitemap.xml` — Cache-Control 1h + SWR 2h |
| **Robots** | N/A | No robots.txt route found |

---

### C) DB-Heavy Endpoints

| Endpoint | Load | Notes |
|----------|------|-------|
| **Product detail** | Medium | getProductById + getRecommendedProducts; includes images, brand |
| **Shop listing** | **High** | getProducts() — all products, no limit |
| **Category** | **High** | getProducts() + client filter — fetches all products |
| **Admin dashboard** | **High** | 8+ parallel queries: counts, aggregates, raw SQL monthly, groupBy categories |
| **Admin products** | Medium | Paginated (limit 20), includes category, brand, variants, images |
| **Feeds** | Medium | findMany 1000 products with images |
| **Sitemap** | Low | category slugs + product IDs only |

---

### D) Inventory/Price Volatility

| Field | Source | Real-time? | Cache-safe? |
|-------|--------|------------|-------------|
| **Stock** | `Product.stock` (Prisma) | Checkout does **not** validate stock before order creation | Listing can be cached 1–5 min; product page can show cached stock |
| **Price** | `Product.sellingPrice` | Admin-edited | Can cache 1–5 min |
| **inStock** | Derived: `(stock ?? 0) > 0` | Same as stock | Same as stock |

**Checkout:** No stock validation in `createOrderPrisma`. Orders are created with client-submitted qty/price. Stock is not decremented on order (no inventory reservation found). **Conclusion:** Stock can be eventually consistent; short cache (1–2 min) acceptable for storefront.

---

## STEP 2 — PROPOSED CACHING DESIGN

### 1) ISR Revalidate by Page Type

| Page | Revalidate | Remove force-dynamic? |
|------|------------|----------------------|
| Home | 120s (2 min) | Yes — remove force-dynamic |
| Shop | 300s (5 min) | Yes — remove force-dynamic |
| Product detail | 120s (2 min) | Yes — remove force-dynamic |
| Category | 300s (5 min) | Yes — remove force-dynamic |
| Blog list | 300s | Yes |
| Blog post | 300s | Yes |
| Combo offers | 300s | Yes |
| Account/Admin | — | Keep force-dynamic |

### 2) Tag-Based Revalidation

**Tags to introduce:**
- `products` — product list, shop, category
- `product-[id]` — single product
- `home` — home data, featured, flash, clearance, combos
- `settings` — site settings, sales top bar
- `feeds` — Meta/Google feeds
- `sitemap` — sitemap

**Revalidation triggers:**

| Event | revalidateTag / revalidatePath |
|-------|-------------------------------|
| Product CRUD (create/update/delete) | `products`, `product-[id]`, `home`, `feeds`, `sitemap` |
| Stock update | `products`, `product-[id]`, `feeds` |
| Settings update | `settings`, `home` |
| Category CRUD | `products`, `sitemap` |
| Bulk import | `products`, `home`, `feeds`, `sitemap` |
| Home blocks / banners | `home` |

### 3) API Cache-Control Rules

| Endpoint | Rule | Rationale |
|----------|------|-----------|
| `/api/settings` | `public, s-maxage=60, stale-while-revalidate=300` | Anonymous, low churn |
| `/api/settings/sales-top-bar` | `public, s-maxage=60` | Same |
| `/api/feeds/*` | Keep existing 1h + SWR 2h | Already set |
| `/api/products/by-ids` | `public, s-maxage=120` | Product lookup for cart/checkout |
| User-specific (account, admin) | `private, no-store` | Keep |

**next.config.js:** Remove or narrow the blanket `no-store` for `/api/*` so route-level Cache-Control can apply. Option: only apply no-store to `/api/admin/*`, `/api/auth/*`, `/api/checkout/*`, `/api/invoice`, etc.

### 4) Hybrid Product Page (Optional Phase 2)

- **Cached:** Product name, description, images, price (ISR 2 min)
- **Live block:** Stock/inStock via small client fetch or server component with `unstable_noStore` for stock only
- **Simpler first phase:** Full page ISR 2 min; stock eventually consistent (acceptable per audit)

---

## STEP 3 — IMPLEMENTATION PLAN (NO CODE YET)

### Phase 1: Storefront ISR (Core)

#### Files to Change

| File | Change |
|------|--------|
| `app/page.tsx` | Remove `dynamic = "force-dynamic"`; keep `revalidate = 120` |
| `app/shop/page.tsx` | Remove `dynamic = "force-dynamic"`; keep `revalidate = 300` |
| `app/product/[id]/page.tsx` | Remove `dynamic = "force-dynamic"`; add `revalidate = 120` |
| `app/category/[...slug]/page.tsx` | Remove `dynamic = "force-dynamic"`; add `revalidate = 300` |
| `app/blog/page.tsx` | Remove `dynamic = "force-dynamic"`; add `revalidate = 300` |
| `app/blog/[slug]/page.tsx` | Remove `dynamic = "force-dynamic"`; add `revalidate = 300` |
| `app/combo-offers/page.tsx` | Remove `dynamic = "force-dynamic"`; add `revalidate = 300` |
| `app/landing/[slug]/page.tsx` | Remove `dynamic = "force-dynamic"`; add `revalidate = 300` |

### Phase 2: Tag-Based Revalidation

#### New File
- `lib/cache-tags.ts` — export tag constants: `PRODUCTS`, `PRODUCT(id)`, `HOME`, `SETTINGS`, `FEEDS`, `SITEMAP`

#### Wrap Data Fetches with `unstable_cache` (Next.js 14)
- `lib/data/db-products.ts` — wrap `getProducts`, `getProductById`, `getFeaturedProducts`, etc. with `unstable_cache` + tags
- `src/data/provider-db.ts` — `getHomeData` with `unstable_cache` + tag `home`
- Or: use `revalidateTag` in mutation routes without wrapping fetches (simpler: rely on page-level revalidate only for Phase 1)

**Simpler approach for Phase 1:** Do NOT add `unstable_cache` yet. Use only page-level `revalidate`. Add tag-based revalidation in Phase 2 when we have revalidateTag calls in admin mutations.

#### Mutation Routes — Add revalidatePath
- `app/api/admin/products/route.ts` (POST, PATCH, DELETE) — `revalidatePath("/shop")`, `revalidatePath("/")`, `revalidatePath(\`/product/${id}\`)`
- `app/api/admin/products/stock/route.ts` (PATCH) — same
- `app/api/admin/products/import/route.ts` — revalidatePath("/shop"), ("/")
- `app/api/admin/settings/route.ts` — revalidatePath("/")
- `app/api/admin/home-banner-slides/route.ts` — revalidatePath("/")

### Phase 3: API Cache-Control

#### Files to Change
- `next.config.js` — Replace blanket `no-store` for `/api/((?!feeds).*)` with:
  - `no-store` only for: `/api/admin/*`, `/api/auth/*`, `/api/checkout/*`, `/api/invoice`, `/api/track-order/*`, `/api/webhooks/*`, `/api/analytics/*`
  - Allow route-level Cache-Control for: `/api/settings`, `/api/feeds`, `/api/products/by-ids` (if we add cache there)
- `app/api/settings/route.ts` — Ensure Cache-Control header is sent (already has it; verify config doesn’t override)
- `app/api/products/by-ids/route.ts` — Add `Cache-Control: public, s-maxage=120` if used for anonymous product lookup

### Phase 4: Sitemap / Robots (Optional)
- Add `app/robots.txt/route.ts` if missing — static or cached
- Sitemap already has Cache-Control

---

### Rollout Steps

1. **Phase 1a:** Remove force-dynamic from Home, Shop, Product, Category only. Deploy. Verify pages render.
2. **Phase 1b:** Add revalidate to Blog, Combo, Landing. Deploy.
3. **Phase 2:** Add revalidatePath in admin product/stock/settings mutations. Deploy.
4. **Phase 3:** Adjust next.config Cache-Control. Deploy. Verify `/api/settings` returns cache headers.
5. **Phase 4:** Add robots.txt if needed.

---

### Backward Compatibility

- **ISR:** First request after deploy is a cache miss; subsequent requests get cached. No breaking change.
- **revalidatePath:** Only invalidates Next.js data cache; no API contract change.
- **next.config headers:** Narrowing no-store may allow CDN to cache some APIs. Ensure no user-specific data in cached responses.

---

### Test Plan

1. **Unit test:** `lib/cache-tags.ts` — export tag constants (trivial).
2. **Playwright smoke:**
   - Product page renders: `GET /product/[id]` → 200
   - Add to cart works (client-side)
   - Shop page loads products
3. **Header verification:**
   - `curl -sI https://site/api/settings` → expect `Cache-Control: public, s-maxage=60...`
   - `curl -sI https://site/api/feeds/meta` → expect `Cache-Control: public, s-maxage=3600...`
   - `curl -sI https://site/shop` → expect `Cache-Control` with `s-maxage` (ISR) or `x-nextjs-cache: HIT` on repeat

---

### Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| Typecheck | `npm run typecheck` | 0 errors |
| Lint | `npm run lint` | 0 errors |
| Tests | `npm test` | All pass |
| Home | `curl -sI http://localhost:3000/` | 200, no force-dynamic bypass |
| Shop | `curl -sI http://localhost:3000/shop` | 200 |
| Product | `curl -sI http://localhost:3000/product/[id]` | 200 |
| Settings API | `curl -sI http://localhost:3000/api/settings` | Cache-Control present |
| Playwright | `npx playwright test tests/smoke.spec.ts` | Pass |

---

## STOP — AWAITING CONFIRMATION

Reply with **CONFIRM PR-8** to proceed with implementation.
