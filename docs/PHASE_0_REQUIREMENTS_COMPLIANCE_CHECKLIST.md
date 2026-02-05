# Phase 0 — Requirements Compliance Checklist

**Generated:** Evidence-based audit. Source: user requirements + reference screenshots.

---

## Legend

- ✅ Implemented / compliant
- ⚠️ Partial / needs improvement  
- ❌ Missing / not implemented

---

## REQUIREMENTS TABLE


| #                                  | Requirement                                        | Status | Evidence (file paths)                                                          | Fix plan                                                                         |
| ---------------------------------- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **PHASE 1 — BRANDING + UI POLISH** |                                                    |        |                                                                                |                                                                                  |
| 1.1                                | Theme tokens (--brand, --brand-foreground, etc.)   | ✅      | `app/globals.css:5-18`, `tailwind.config.ts:10-25`                             | OK                                                                               |
| 1.2                                | Replace scattered colors with tokens               | ⚠️     | Some pages use `text-gray-900`, `bg-slate-100` instead of tokens               | Audit and replace with `text-brand`, `bg-surface-muted` where appropriate        |
| 1.3                                | TwoToneText component (brand + dark contrast)      | ✅      | `components/ui/TwoToneText.tsx`                                                | OK                                                                               |
| 1.4                                | TwoToneText used in hero/product overlays          | ❌      | Component exists; not imported in HeroSlider, ProductCard overlays             | Add TwoToneText to hero slides, promo banners, product overlays                  |
| 1.5                                | Mobile: spacing, tap targets                       | ⚠️     | General responsive; no explicit tap-target audit                               | Ensure 44px min touch targets                                                    |
| 1.6                                | Sticky CTA not overlap WhatsApp                    | ✅      | `ProductDetailContent.tsx:348` z-30, FloatingUI z-40                           | OK                                                                               |
| 1.7                                | No layout shift (CLS); skeletons                   | ⚠️     | `LazyBelowFold`, some skeletons; checkout may shift                            | Add skeletons for checkout async; audit CLS                                      |
| 1.8                                | SafeImage/next/image everywhere                    | ✅      | `components/media/SafeImage.tsx`, used in ProductCard, ProductDetail, etc.     | OK                                                                               |
| 1.9                                | Lazy-load below-fold                               | ✅      | `components/ui/LazyBelowFold.tsx`, dynamic import for Brands, Reviews          | OK                                                                               |
| **PHASE 2 — HOMEPAGE LAYOUT**      |                                                    |        |                                                                                |                                                                                  |
| 2.1                                | Mega menu: Category → Subcategory panel            | ✅      | `CategoryMegaMenu.tsx:182-208`, `lib/categories-master.ts`                     | OK                                                                               |
| 2.2                                | Mega menu: Subcategory hover → **Products** panel  | ❌      | Flyout shows subcategory links only, no product list                           | Add products panel: fetch top products per subcategory (tag/subcategory mapping) |
| 2.3                                | Mega menu: keyboard accessible                     | ✅      | `handleKeyDown`, Escape, ArrowDown/Up                                          | OK                                                                               |
| 2.4                                | Mega menu: mobile accordion                        | ✅      | `mobileOpen`, tap-to-expand                                                    | OK                                                                               |
| 2.5                                | Category + subcategory list (10 cats, no missing)  | ✅      | `lib/categories-master.ts` – all 10 categories + subcategories                 | OK                                                                               |
| 2.6                                | Featured Brands BEFORE Flash Sale                  | ✅      | `lib/commerce-settings.ts` order 1 vs 2                                        | OK                                                                               |
| 2.7                                | Review section replaces old Brand position         | ✅      | `DEFAULT_HOMEPAGE_BLOCKS` has reviews order 5                                  | OK                                                                               |
| 2.8                                | Featured Brands: logo grid/slider                  | ✅      | `FeaturedBrandsSlider.tsx`, `lib/brands-master.ts`                             | OK                                                                               |
| 2.9                                | Brands editable in Admin (name, slug, logo, order) | ⚠️     | `lib/brands-master.ts` hardcoded; `app/admin/brands/page.tsx` exists           | Wire Admin brands to DB/CMS; fallback to MASTER_BRANDS                           |
| **PHASE 3 — PRODUCT PAGE**         |                                                    |        |                                                                                |                                                                                  |
| 3.1                                | Buy Now: add variation + qty → checkout            | ✅      | `ProductDetailContent.tsx:105-116`                                             | OK                                                                               |
| 3.2                                | Buy Now: idempotent, no duplicate on double-click  | ⚠️     | `buyNowProcessing` disables; race possible on rapid click                      | Add ref guard or debounce                                                        |
| 3.3                                | Buy Now: validate inStock + variation              | ✅      | `canBuyNow` checks product.inStock, selectedVariation.inStock                  | OK                                                                               |
| 3.4                                | Buy Now: toast feedback                            | ❌      | No toast on success                                                            | Add toast (or inline feedback)                                                   |
| 3.5                                | Remove secure payment under Add to Cart            | ✅      | ProductDetailContent does not use SecurePaymentBadges                          | OK                                                                               |
| **PHASE 4 — CHECKOUT**             |                                                    |        |                                                                                |                                                                                  |
| 4.1                                | Coupon BEFORE payment methods                      | ✅      | `app/checkout/page.tsx:169-201` before 204-233                                 | OK                                                                               |
| 4.2                                | Left: payment tabs + form; Right: order summary    | ✅      | Grid lg:grid-cols-5, col-span-3 left, col-span-2 right                         | OK                                                                               |
| 4.3                                | Mandatory Terms checkbox                           | ✅      | `checkoutSchema`, `acceptTerms`                                                | OK                                                                               |
| 4.4                                | Terms links (Admin-editable)                       | ⚠️     | Checkout links to /terms, /privacy; not from Admin                             | Add Admin-editable Terms/Privacy URLs                                            |
| 4.5                                | Delivery charge preview (Inside/Outside Dhaka)     | ⚠️     | Shown in summary; not clearly "Inside/Outside Dhaka" labeled                   | Add explicit zone label                                                          |
| 4.6                                | Zod + BD phone validation                          | ✅      | `lib/validations/checkout.ts`                                                  | OK                                                                               |
| 4.7                                | Voucher from API (no hardcode)                     | ✅      | `/api/checkout/voucher`, `handleApplyVoucher`                                  | OK                                                                               |
| 4.8                                | Delivery from settings                             | ✅      | `/api/checkout/settings`, `lib/checkout.ts` overrides                          | OK                                                                               |
| **PHASE 5 — REVIEWS**              |                                                    |        |                                                                                |                                                                                  |
| 5.1                                | Login required                                     | ✅      | `app/api/reviews/route.ts` getUserId                                           | OK                                                                               |
| 5.2                                | Order dropdown (delivered only)                    | ✅      | `ProductReviewForm`, `/api/reviews/orders`                                     | OK                                                                               |
| 5.3                                | (orderId + productId) unique                       | ✅      | Supabase unique constraint; API check                                          | OK                                                                               |
| 5.4                                | Verified Purchase badge                            | ✅      | Tied to order                                                                  | OK                                                                               |
| 5.5                                | Moderation (pending/approved)                      | ✅      | `product_reviews.status`, Admin Review Moderation                              | OK                                                                               |
| 5.6                                | review_eligible_days setting                       | ✅      | `site_settings.review_eligible_days`, migration 005                            | OK                                                                               |
| **PHASE 6 — TRACKING & COURIER**   |                                                    |        |                                                                                |                                                                                  |
| 6.1                                | Admin: bulk select + bulk courier booking          | ✅      | `AdminOrdersClient.tsx`, `/api/admin/courier-booking`                          | OK                                                                               |
| 6.2                                | Provider select (Pathao/Steadfast/RedX)            | ✅      | Dropdown in bulk bar                                                           | OK                                                                               |
| 6.3                                | Track by Order ID OR Phone                         | ✅      | `app/track-order/page.tsx`, `/api/track-order`                                 | OK                                                                               |
| 6.4                                | BD phone validation                                | ✅      | `lib/phone-bd.ts`                                                              | OK                                                                               |
| 6.5                                | OTP for phone tracking (Admin toggle)              | ❌      | No Admin setting                                                               | Add `require_otp_phone_tracking` to site_settings; enforce in API                |
| 6.6                                | Realtime timeline (notes + events)                 | ⚠️     | API returns notes/events; polling every 10s; no Supabase Realtime subscription | Add Supabase Realtime on order_notes, order_status_events when connected         |
| 6.7                                | Admin: add notes (public/internal)                 | ❌      | No UI to add order notes                                                       | Add note form in admin order detail                                              |
| 6.8                                | Server Health & Error Logs panel                   | ❌      | Not implemented                                                                | New Admin page; log payment/courier/webhook errors                               |
| **PHASE 7 — AUTH**                 |                                                    |        |                                                                                |                                                                                  |
| 7.1                                | Remove demo credentials from login UI              | ✅      | Shown only when AUTH_MODE=demo AND NODE_ENV !== production                     | OK                                                                               |
| 7.2                                | Demo mode only when explicit                       | ✅      | `src/config/runtime.ts` defaults supabase in prod                              | OK                                                                               |
| 7.3                                | Google / Facebook / Phone OTP                      | ✅      | `LoginForm.tsx`, `/auth/callback`, Supabase Auth                               | OK                                                                               |
| 7.4                                | Admin toggles per provider                         | ✅      | Admin Settings → Auth Providers                                                | OK                                                                               |
| **PHASE 8 — ANALYTICS**            |                                                    |        |                                                                                |                                                                                  |
| 8.1                                | Events Dashboard (list, totals, filters)           | ✅      | `app/admin/analytics/page.tsx`                                                 | OK                                                                               |
| 8.2                                | Store events server-side                           | ✅      | `/api/analytics/events`, `analytics_events` table                              | OK                                                                               |
| 8.3                                | captureEvent (ViewContent, AddToCart, etc.)        | ✅      | `lib/analytics.ts`, wired in Product, Cart, Checkout                           | OK                                                                               |
| 8.4                                | event_id dedup                                     | ✅      | API checks event_id before insert                                              | OK                                                                               |
| 8.5                                | Event Debug Panel (last N, payload, dedup status)  | ❌      | Events table exists; no dedicated "Debug" panel                                | Add Event Debug Panel: last 20 events, payload, dedup                            |
| 8.6                                | Meta Pixel + CAPI (server-side)                    | ❌      | Schema has fields; no client/server wiring                                     | Wire Meta Pixel + CAPI; env for tokens                                           |
| 8.7                                | TikTok Pixel / Events API                          | ❌      | Not implemented                                                                | Add TikTok integration; Admin toggle                                             |
| 8.8                                | GTM (browser)                                      | ✅      | `AnalyticsScripts.tsx`, `NEXT_PUBLIC_GTM_ID`                                   | OK                                                                               |
| 8.9                                | Admin toggles (Meta, TikTok, GTM, CF)              | ⚠️     | Settings has Auth; Analytics toggles in Integrations                           | Ensure all platforms have toggles                                                |
| **PHASE 9 — ADMIN DASHBOARD UI**   |                                                    |        |                                                                                |                                                                                  |
| 9.1                                | KPI cards                                          | ✅      | `AdminDashboardClient.tsx` summaryCards                                        | OK                                                                               |
| 9.2                                | Charts with date filters                           | ⚠️     | LineChart present; no date range filter                                        | Add date filter (e.g. last 7d, 30d)                                              |
| 9.3                                | Orders status chart                                | ⚠️     | salesData by day; no explicit status breakdown                                 | Add orders-by-status chart                                                       |
| 9.4                                | Orders: "All Status" filter dropdown               | ❌      | No status filter on orders table                                               | Add dropdown: All, Pending, Confirmed, Delivered, etc.                           |
| 9.5                                | Bulk assign + bulk courier entry                   | ✅      | Bulk Book Courier in AdminOrdersClient                                         | OK                                                                               |
| 9.6                                | Dashboard widgets drag & drop                      | ❌      | Widgets fixed order                                                            | Add drag-and-drop; persist per user in DB                                        |
| 9.7                                | Product tags: "Choose from most used tags"         | ❌      | `app/admin/product-tags/page.tsx` has Add form + table; no "most used" picker  | Add link + modal/list of popular tags                                            |
| 9.8                                | Product tags: "Separate tags with commas"          | ❌      | Current UI: Name, Slug, Description form                                       | Add inline tag input with comma-separated + "Add" (match reference)              |
| **PHASE 10 — SEO + NO-ERROR**      |                                                    |        |                                                                                |                                                                                  |
| 10.1                               | Metadata Home/Shop/Product/Category/Blog           | ✅      | `app/layout.tsx`, generateMetadata in pages                                    | OK                                                                               |
| 10.2                               | Canonical via NEXT_PUBLIC_SITE_URL                 | ✅      | JSON-LD, metadata                                                              | OK                                                                               |
| 10.3                               | JSON-LD Product + Breadcrumb                       | ✅      | `ProductDetailContent.tsx`                                                     | OK                                                                               |
| 10.4                               | sitemap.xml + robots.txt                           | ✅      | `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`                          | OK                                                                               |
| 10.5                               | Loading/error boundaries                           | ⚠️     | Some loading.tsx; not all routes                                               | Add loading.tsx for key routes                                                   |
| 10.6                               | No hydration warnings                              | ⚠️     | Requires manual test                                                           | Audit and fix                                                                    |
| **HARDCODED VALUES**               |                                                    |        |                                                                                |                                                                                  |
| H1                                 | Delivery charges                                   | ✅      | From `/api/checkout/settings`                                                  | OK                                                                               |
| H2                                 | Voucher codes                                      | ✅      | From `/api/checkout/voucher`                                                   | OK                                                                               |
| H3                                 | District list                                      | ⚠️     | `lib/checkout-districts.ts` static                                             | Consider Admin-editable                                                          |
| H4                                 | GTM/Pixel IDs on product card                      | ❌      | Reference shows GTM/Pixel per product; avoid hardcode                          | Store in site_settings or product metadata; Admin config                         |
| **DB / MIGRATIONS**                |                                                    |        |                                                                                |                                                                                  |
| D1                                 | order_notes table                                  | ✅      | `supabase/migrations/005_*.sql`                                                | OK                                                                               |
| D2                                 | order_status_events table                          | ✅      | Migration 005                                                                  | OK                                                                               |
| D3                                 | product_reviews table                              | ✅      | Migration 005                                                                  | OK                                                                               |
| D4                                 | analytics_events table                             | ✅      | Migration 005                                                                  | OK                                                                               |
| D5                                 | auth_providers in site_settings                    | ✅      | Migration 004                                                                  | OK                                                                               |


---

## SITE AUDIT REPORT

### Storefront Audit


| Route                           | Status | Notes                                                                              |
| ------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `/` (Home)                      | ✅      | Hero, CategoryMegaMenu, blocks (Featured, Brands, Flash Sale, etc.), LazyBelowFold |
| `/shop`                         | ✅      | ShopClient, filters                                                                |
| `/shop/[slug]`                  | ✅      | Product listing by category                                                        |
| `/product/[id]`                 | ✅      | ProductDetailContent, Buy Now, variations, JSON-LD                                 |
| `/cart`                         | ✅      | Cart page                                                                          |
| `/checkout`                     | ✅      | Coupon first, payment tabs, form, summary; voucher/delivery from API               |
| `/order-complete`               | ✅      | Post-checkout                                                                      |
| `/track-order`                  | ✅      | Order ID or phone; BD validation; timeline; polling for Supabase                   |
| `/blog`                         | ✅      | Blog listing                                                                       |
| `/blog/[slug]`                  | ✅      | Blog post                                                                          |
| `/category/[...slug]`           | ✅      | CategoryClient                                                                     |
| `/terms`, `/privacy`, `/refund` | ✅      | Policy pages                                                                       |


**Evidence:** `app/page.tsx`, `app/shop/page.tsx`, `app/product/[id]/page.tsx`, `app/checkout/page.tsx`, `app/track-order/page.tsx`, `app/blog/page.tsx`, `app/category/[...slug]/page.tsx`

### Account Audit


| Route                  | Status | Notes                                                                  |
| ---------------------- | ------ | ---------------------------------------------------------------------- |
| `/login`               | ✅      | LoginForm: demo + Google/Facebook/Phone OTP; demo creds hidden in prod |
| `/register`            | ✅      | Register page                                                          |
| `/account`             | ✅      | Account layout                                                         |
| `/account/orders`      | ✅      | Orders list                                                            |
| `/account/orders/[id]` | ✅      | Order detail                                                           |
| `/account/invoices`    | ✅      | Invoices                                                               |
| `/account/returns`     | ✅      | Returns                                                                |


**Evidence:** `app/login/page.tsx`, `app/login/LoginForm.tsx`, `app/account/layout.tsx`, `app/account/orders/page.tsx`, `app/account/invoices/page.tsx`, `app/account/returns/page.tsx`

### Admin Audit


| Route                      | Status | Notes                                                              |
| -------------------------- | ------ | ------------------------------------------------------------------ |
| `/admin`                   | ✅      | AdminDashboardClient, KPI cards, charts                            |
| `/admin/orders`            | ✅      | AdminOrdersClient: bulk select, bulk courier; **no status filter** |
| `/admin/orders/[id]`       | ✅      | Order detail                                                       |
| `/admin/products`          | ✅      | Products CRUD                                                      |
| `/admin/categories`        | ✅      | Categories CRUD                                                    |
| `/admin/brands`            | ✅      | Brands management                                                  |
| `/admin/product-tags`      | ⚠️     | Exists; no "most used tags" picker, no comma-separated input       |
| `/admin/analytics`         | ✅      | Events list, filters                                               |
| `/admin/reviews`           | ✅      | Review moderation                                                  |
| `/admin/settings`          | ✅      | Auth providers, integrations                                       |
| `/admin/courier`           | ✅      | Courier settings                                                   |
| `/admin/checkout-settings` | ✅      | Delivery, etc.                                                     |


**Evidence:** `app/admin/` directory, `app/admin/layout.tsx`, `app/admin/orders/AdminOrdersClient.tsx`, `app/admin/analytics/page.tsx`, `app/admin/product-tags/page.tsx`

### Issues Summary


| Type                   | Examples                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime errors**     | None identified in static audit; requires manual run                                                                                              |
| **Console errors**     | None identified; requires DevTools check                                                                                                          |
| **Hydration warnings** | `useSearchParams` in LoginForm wrapped in Suspense; may need audit                                                                                |
| **Broken links**       | Duplicate policy routes: `/privacy` vs `/privacy-policy`, `/terms` vs `/terms-conditions`, `/about` vs `/about-us`; redirects or canonical needed |
| **Settings missing**   | OTP-for-phone-tracking toggle, Event Debug Panel, Server Health & Error Logs                                                                      |
| **Hardcoded values**   | District list in `lib/checkout-districts.ts`; MASTER_BRANDS in `lib/brands-master.ts` (Admin brands page may override)                            |
| **Performance**        | SafeImage used; LazyBelowFold; dynamic imports; may need Lighthouse run                                                                           |


### Implementation Plan (Commits)


| Commit | Scope                                                   | Files to change                                                            |
| ------ | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1      | Theme tokens + TwoToneText usage + global styles        | `globals.css`, `tailwind.config.ts`, HeroSlider, PromoBanners, ProductCard |
| 2      | Product Buy Now fix + remove secure payment             | `ProductDetailContent.tsx` (toast, debounce)                               |
| 3      | Checkout redesign + voucher before payment + validation | `checkout/page.tsx`, Terms links from Admin                                |
| 4      | Mega menu products panel + mobile accordion             | `CategoryMegaMenu.tsx`, data provider for products-by-subcategory          |
| 5      | Section reorder + Featured Brands + Review section      | `commerce-settings.ts`, `page.tsx` (already done)                          |
| 6      | Review system (login + order dropdown + server)         | Already done                                                               |
| 7      | Courier bulk + tracking by phone + realtime timeline    | Add Admin note form; Supabase Realtime; OTP toggle                         |
| 8      | Auth improvements                                       | Already done                                                               |
| 9      | Admin events dashboard + Event Debug Panel              | `admin/analytics/`, new Debug sub-page                                     |
| 10     | Admin dashboard drag & drop + orders UI                 | `AdminDashboardClient.tsx`, `AdminOrdersClient.tsx` (All Status filter)    |
| 11     | Performance + SEO + bugfix sweep                        | Lazy load, skeletons, loading.tsx, fix duplicate routes                    |


---

## QA TEST SCRIPT (30-MIN VERIFICATION)

### Storefront (10 min)

- `/` – Hero loads, mega menu hover shows subcategories
- `/shop` – Products load, filters work
- `/product/[id]` – Add to Cart, Buy Now (variation + qty) → checkout
- `/cart` – Items, quantity, remove
- `/checkout` – Coupon before payment, form validation, Terms checkbox, place order
- `/order-complete` – Success message
- `/track-order` – By Order ID and by phone (BD format)
- `/blog`, `/blog/[slug]` – Load
- Policy: `/terms`, `/privacy`, `/refund` – Load

### Account (5 min)

- `/login` – Demo or Supabase providers
- `/register` – Form
- `/account` – Orders, invoices, returns

### Admin (10 min)

- `/admin` – Dashboard, KPI cards
- `/admin/orders` – List, bulk select, Bulk Book Courier
- `/admin/orders/[id]` – Detail
- `/admin/products` – CRUD
- `/admin/analytics` – Events list, filters
- `/admin/reviews` – Approve/Reject
- `/admin/product-tags` – Add tag

### Tracking + Events (5 min)

- Track by orderId and by phone
- Add to cart → Admin events shows AddToCart
- Purchase → Admin events shows Purchase

---

## VERCEL DEPLOYMENT + CUSTOM DOMAIN

### Required Env Vars

- `NEXT_PUBLIC_SITE_URL` – Canonical (e.g. [https://citypluspetshop.com](https://citypluspetshop.com))
- `NEXT_PUBLIC_DATA_SOURCE` – `supabase` for production
- `NEXT_PUBLIC_AUTH_MODE` – `supabase` for production
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GTM_ID` (optional)
- `NEXT_PUBLIC_ENABLE_GTM` (optional)
- `NEXT_PUBLIC_ENABLE_CF_ANALYTICS` (optional)
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` (optional)

### Build Verification

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`

### Domain

- Add custom domain in Vercel project settings
- At registrar: A record or CNAME to Vercel (per Vercel instructions)
- SSL auto-provisioned by Vercel

### Post-Deploy Smoke Test

- Homepage loads
- Add to cart, checkout (test order)
- Track order by ID
- Admin login and dashboard

