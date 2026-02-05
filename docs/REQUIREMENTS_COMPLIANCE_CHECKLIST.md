# Requirements Compliance Checklist – City Plus Pet Shop

**Generated:** Full A–Z audit. Source: conversation requirements.

---

## Legend

- ✅ Implemented / compliant
- ⚠️ Partial / needs improvement
- ❌ Missing / not implemented

---

## PHASE 0 — BASELINE

### Demo Mode Behavior (All Locations)


| Location         | File:Line                              | Description                                                                     |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Auth default     | `src/config/runtime.ts:9-10`           | `AUTH_MODE` defaults to `"demo"`                                                |
| Auth default     | `middleware.ts:4`                      | `AUTH_MODE ?? "demo"`                                                           |
| Demo credentials | `app/api/auth/demo-login/route.ts:3-4` | `DEMO_ADMIN`, `DEMO_USER` hardcoded                                             |
| Demo banner      | `app/login/page.tsx:52-56`             | "Demo mode: use [user@cityplus.local](mailto:user@cityplus.local) / User@12345" |
| Demo banner      | `app/admin/login/page.tsx:51-55`       | "Demo: [admin@cityplus.local](mailto:admin@cityplus.local) / Admin@12345"       |
| Demo session     | `middleware.ts:16`                     | `demo_session` cookie checked                                                   |
| Demo empty msg   | `app/admin/orders/page.tsx:28`         | "Connect Supabase or use DATA_SOURCE=local for demo data"                       |
| Demo reviews     | `app/api/reviews/route.ts:19-24,37-39` | Reviews require demo session; only work with `DATA_SOURCE=local`                |


### Current Analytics / Tracking


| Integration        | Status                    | Evidence                                                                                                                 |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| GTM                | ⚠️ Wired, no events fired | `components/AnalyticsScripts.tsx`, `lib/analytics.ts` – `pushDataLayer` exists but not called from Cart/Product/Checkout |
| Cloudflare         | ⚠️ Env-driven             | `AnalyticsScripts.tsx` – loads when `NEXT_PUBLIC_ENABLE_CF_ANALYTICS=true`                                               |
| Meta Pixel/CAPI    | ❌ Not wired               | `lib/schema.ts` has `facebook_pixel_id`, `facebook_capi_token` – no client code                                          |
| Server-side events | ❌ Missing                 | No API to store events in `analytics` table                                                                              |
| Event types        | ⚠️ Types only             | `lib/analytics.ts` defines ViewContent, AddToCart, etc. – no capture                                                     |


---

## REQUIREMENTS TABLE


| #                         | Requirement                                         | Status | Evidence                                                                 | Fix Plan                                                                                       |
| ------------------------- | --------------------------------------------------- | ------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **PRODUCTION MODE**       |                                                     |        |                                                                          |                                                                                                |
| P1                        | Default auth = Supabase in production               | ❌      | `src/config/runtime.ts:10` defaults `"demo"`                             | Use `NODE_ENV` or explicit `NEXT_PUBLIC_AUTH_MODE=supabase` for prod                           |
| P2                        | Remove demo credentials from login UI               | ❌      | `app/login/page.tsx:52-56`, `app/admin/login/page.tsx:51-55`             | Remove conditional demo hint blocks when not demo                                              |
| P3                        | Remove "demo" text/hints from UI                    | ⚠️     | Multiple locations above                                                 | Remove all demo banners/hints when production                                                  |
| P4                        | Demo-login route only when demo enabled             | ❌      | `app/api/auth/demo-login/route.ts` always active                         | Add env check; return 404 when production                                                      |
| **AUTH UPGRADES**         |                                                     |        |                                                                          |                                                                                                |
| A1                        | Google OAuth                                        | ❌      | —                                                                        | Add Supabase Auth Google provider; Admin toggle                                                |
| A2                        | Facebook OAuth                                      | ❌      | —                                                                        | Add Supabase Auth Facebook provider; Admin toggle                                              |
| A3                        | Phone OTP (Bangladesh)                              | ❌      | —                                                                        | Supabase phone auth; BD format validation; OTP expiry/resend                                   |
| A4                        | Admin toggles per provider                          | ❌      | —                                                                        | Add auth provider toggles in Admin settings                                                    |
| **COURIER**               |                                                     |        |                                                                          |                                                                                                |
| C1                        | Admin bulk order select (checkboxes)                | ❌      | `app/admin/orders/page.tsx` – no checkboxes                              | Add multi-select + "Select all on page"                                                        |
| C2                        | Bulk Book Courier action                            | ❌      | —                                                                        | Add bulk action bar; provider select (Pathao/Steadfast/RedX)                                   |
| C3                        | One-click booking per order                         | ❌      | —                                                                        | Create consignment; store waybill; retry on failure                                            |
| C4                        | Courier API keys in Admin (server-only)             | ⚠️     | `courier_configs` table exists; `app/admin/courier/page.tsx` stub        | Wire courier page to DB; server-side API for booking                                           |
| **TRACKING**              |                                                     |        |                                                                          |                                                                                                |
| T1                        | Track by Order ID OR Phone                          | ⚠️     | `app/track-order/page.tsx` – single input, mock result                   | Add phone/orderId detection; BD phone validation                                               |
| T2                        | Phone search returns matching orders                | ❌      | —                                                                        | API: search orders by guest_phone or user phone                                                |
| T3                        | Realtime timeline (Supabase Realtime)               | ❌      | —                                                                        | `order_notes`, `order_status_events` tables; Realtime subscription                             |
| T4                        | Admin/courier notes system                          | ❌      | `orders` has `order_notes` col (migration 002)                           | Add `order_notes` table (id, order_id, type, visibility, message, created_by, created_at)      |
| T5                        | order_status_events table                           | ❌      | —                                                                        | New migration; Realtime on these tables                                                        |
| **REVIEWS**               |                                                     |        |                                                                          |                                                                                                |
| R1                        | Login required to submit                            | ✅      | `app/api/reviews/route.ts:19-24`, `ProductReviewForm`                    | Already enforced                                                                               |
| R2                        | Order dropdown (delivered only)                     | ✅      | `ProductReviewForm`, `/api/reviews/orders`                               | Already implemented                                                                            |
| R3                        | (orderId + productId) unique                        | ✅      | `app/api/reviews/route.ts:52-54` in-memory                               | Move to Supabase with unique constraint                                                        |
| R4                        | Verified purchase badge                             | ✅      | `ProductReviewForm` – verified: true                                     | OK                                                                                             |
| R5                        | Moderation (pending/approved)                       | ❌      | —                                                                        | Add status to reviews; Admin queue                                                             |
| R6                        | Admin setting: review within X days                 | ❌      | —                                                                        | Add `review_eligible_days` to settings                                                         |
| R7                        | Reviews work with Supabase                          | ❌      | `app/api/reviews/route.ts:37-39` returns 501 for non-local               | Persist to Supabase `product_reviews` table                                                    |
| **UI/CHECKOUT/MEGA MENU** |                                                     |        |                                                                          |                                                                                                |
| U1                        | Theme tokens (CSS vars + Tailwind)                  | ✅      | `app/globals.css`, `tailwind.config.ts`                                  | OK                                                                                             |
| U2                        | TwoToneText component                               | ✅      | `components/ui/TwoToneText.tsx`                                          | OK                                                                                             |
| U3                        | Buy Now: add variation + qty → checkout             | ✅      | `ProductDetailContent.tsx:100-111`                                       | OK                                                                                             |
| U4                        | Remove secure payment under Add to Cart             | ✅      | SecurePaymentBadges removed from product page                            | OK                                                                                             |
| U5                        | Checkout: coupon before payment                     | ✅      | `app/checkout/page.tsx` – coupon section first                           | OK                                                                                             |
| U6                        | Checkout: left form, right summary                  | ✅      | `app/checkout/page.tsx` – grid layout                                    | OK                                                                                             |
| U7                        | Terms checkbox mandatory                            | ✅      | `lib/validations/checkout.ts`, `checkout/page.tsx`                       | OK                                                                                             |
| U8                        | Mega menu (hover → subcategories)                   | ✅      | `CategoryMegaMenu.tsx`, `lib/categories-master.ts`                       | OK                                                                                             |
| U9                        | Brands before Flash Sale                            | ✅      | `commerce-settings.ts` order 1 vs 2                                      | OK                                                                                             |
| U10                       | Reviews section (lazy)                              | ✅      | `app/page.tsx`, `HomeReviewSection`, `LazyBelowFold`                     | OK                                                                                             |
| **ANALYTICS EVENTS**      |                                                     |        |                                                                          |                                                                                                |
| E1                        | Meta-like Events view in Admin                      | ❌      | `app/admin/analytics/page.tsx` – placeholder                             | Timeline, event table, filters, match-quality proxies                                          |
| E2                        | Store events server-side                            | ❌      | `analytics` table exists; no insert API                                  | API route + client helper to send events                                                       |
| E3                        | Event types: PageView, ViewContent, AddToCart, etc. | ⚠️     | `lib/analytics.ts` types only                                            | Wire `pushDataLayer` + server event capture                                                    |
| E4                        | event_id dedup                                      | ⚠️     | Types have event_id – not implemented                                    | Generate client event_id; store; dedup on server                                               |
| E5                        | Admin toggles (Meta, TikTok, GTM, CF)               | ⚠️     | `app/admin/settings/page.tsx` – GTM/CF shown                             | Add toggles; wire to loading logic                                                             |
| E6                        | Event Debug Panel in Admin                          | ❌      | —                                                                        | Panel showing recent fired events                                                              |
| **PERFORMANCE + SEO**     |                                                     |        |                                                                          |                                                                                                |
| F1                        | next/image via SafeImage                            | ✅      | `SafeImage` used in ProductCard, ProductDetail, etc.                     | OK                                                                                             |
| F2                        | Lazy load below-fold                                | ✅      | `LazyBelowFold`, dynamic import for Brands, Reviews, Recommended         | OK                                                                                             |
| F3                        | Scripts afterInteractive                            | ✅      | `AnalyticsScripts` uses `strategy="afterInteractive"`                    | OK                                                                                             |
| F4                        | Skeletons for async                                 | ⚠️     | Some routes have Suspense; checkout no skeleton                          | Add skeletons where needed                                                                     |
| S1                        | Metadata Home/Shop/Product/Category/Blog            | ✅      | `app/layout.tsx`, `shop/page.tsx`, `product/[id]` generateMetadata, etc. | OK                                                                                             |
| S2                        | Canonical via NEXT_PUBLIC_SITE_URL                  | ✅      | Used in metadata, JSON-LD                                                | OK                                                                                             |
| S3                        | JSON-LD Product + Breadcrumb                        | ✅      | `ProductDetailContent.tsx:115-134`                                       | OK                                                                                             |
| S4                        | sitemap.xml + robots.txt                            | ✅      | `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`                    | OK                                                                                             |
| **HARDCODED VALUES**      |                                                     |        |                                                                          |                                                                                                |
| H1                        | Delivery 70/130 BDT                                 | ⚠️     | `lib/checkout.ts:7-8`                                                    | Read from site_settings (migration 002 has cols)                                               |
| H2                        | Voucher codes SAVE50, SAVE100                       | ❌      | `app/checkout/page.tsx:72-77`                                            | Validate via vouchers table/API                                                                |
| H3                        | District list                                       | ⚠️     | `lib/checkout-districts.ts` – static                                     | Consider Admin-editable zones                                                                  |
| **DB / MIGRATIONS**       |                                                     |        |                                                                          |                                                                                                |
| D1                        | order_notes table                                   | ❌      | Migration 002 adds cols to orders only                                   | New migration: `order_notes` (id, order_id, type, visibility, message, created_by, created_at) |
| D2                        | order_status_events table                           | ❌      | —                                                                        | New migration                                                                                  |
| D3                        | product_reviews table                               | ❌      | —                                                                        | New migration for Supabase reviews                                                             |
| D4                        | analytics_events (rich schema)                      | ⚠️     | `analytics` table exists, basic schema                                   | Add event_id, source, payload_summary, match-quality fields                                    |
| D5                        | Index order_id, phone                               | ⚠️     | `idx_orders_user`, `idx_orders_created`                                  | Add idx on guest_phone for tracking lookup                                                     |


---

## IMPLEMENTATION ORDER (COMMITS)

1. **Commit 1 – Production mode baseline**
  Default AUTH_MODE to supabase when `NODE_ENV=production`; remove demo hints from login when not demo; guard demo-login route.
2. **Commit 2 – Auth upgrades (Google/Facebook/Phone OTP)**
  Supabase Auth providers; Admin toggles; login page provider buttons.
3. **Commit 3 – DB migrations (order_notes, order_status_events, product_reviews)**
  New migrations; RLS policies.
4. **Commit 4 – Tracking page (Order ID + Phone + Realtime)**
  API for lookup; phone validation; Realtime subscription; notes display.
5. **Commit 5 – Admin bulk courier booking**
  Multi-select orders; bulk action bar; provider select; booking API (Pathao/Steadfast/RedX stubs).
6. **Commit 6 – Reviews Supabase + moderation**
  product_reviews table; API uses Supabase; moderation queue; eligible-days setting.
7. **Commit 7 – Analytics events (server + Admin view)**
  Event capture API; `analytics_events` schema; Admin Events page (timeline, table, filters); wire GTM/Meta.
8. **Commit 8 – Remove hardcoded values**
  Delivery from settings; voucher validation from DB.
9. **Commit 9 – QA + Vercel deployment guide**
  QA test script; deployment checklist.

