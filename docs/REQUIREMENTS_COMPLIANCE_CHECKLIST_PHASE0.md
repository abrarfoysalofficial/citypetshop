# Requirements Compliance Checklist – City Plus Pet Shop
## Phase 0 — Evidence-Based Audit

**Generated:** Full A–Z audit. Source: user requirements Phases 1–10.

---

## Legend
- ✅ Implemented / compliant
- ⚠️ Partial / needs improvement  
- ❌ Missing / not implemented

---

## REQUIREMENTS TABLE

| Requirement | Status | Evidence (file paths) | Fix Plan |
|-------------|--------|------------------------|----------|
| **PHASE 1 — BRANDING + UI POLISH** |
| 1.1 Theme tokens (--brand, --brand-foreground, etc.) | ✅ | `app/globals.css:5-18`, `tailwind.config.ts:10-24` | OK |
| 1.2 Replace scattered colors with tokens | ⚠️ | Some `text-gray-*`, `bg-slate-*` remain; `text-primary`, `bg-primary` used | Audit and replace with tokens where appropriate |
| 1.3 TwoToneText component | ✅ | `components/ui/TwoToneText.tsx` | OK |
| 1.4 TwoToneText on product/hero overlays | ⚠️ | `HeroSlider.tsx:69` uses TwoToneText; ProductCard/product overlays may not | Add TwoToneText to ProductCard/featured overlays if overlay text exists |
| 1.5 Mobile spacing, tap targets | ⚠️ | General Tailwind; no explicit min-tap audit | Add min-h-[44px] for tap targets where needed |
| 1.6 Sticky CTA vs WhatsApp overlap | ✅ | `FloatingUI.tsx:14` bottom-24 on product page; `ProductDetailContent.tsx:361` sticky z-30 | OK |
| 1.7 No CLS, skeletons | ⚠️ | `LazyBelowFold`, `ProductCardSkeleton`; checkout/settings fetch no skeleton | Add skeletons for checkout delivery fetch |
| 1.8 SafeImage/next/image everywhere | ✅ | `SafeImage` in ProductCard, ProductDetail, HeroSlider, FeaturedBrandsSlider | OK |
| 1.9 Lazy-load below-fold | ✅ | `LazyBelowFold`, dynamic import for FeaturedBrandsSlider, HomeReviewSection | OK |
| **PHASE 2 — HOMEPAGE LAYOUT** |
| 2.1 Mega menu: Category → Subcategory | ✅ | `CategoryMegaMenu.tsx`, `lib/categories-master.ts` | OK |
| 2.2 Mega menu: Subcategory → Products panel | ❌ | Flyout shows subcategories only, no product list | Add products panel on subcategory hover; fetch products by subcategorySlug |
| 2.3 Keyboard accessible | ✅ | `CategoryMegaMenu.tsx:57-71` ArrowDown/Up, Escape | OK |
| 2.4 Mobile accordion | ✅ | `CategoryMegaMenu.tsx:124-161` tap-to-expand | OK |
| 2.5 Category + Subcategory list (hard-wired) | ✅ | `lib/categories-master.ts` MASTER_CATEGORIES | OK |
| 2.6 Brands BEFORE Flash Sale | ✅ | `lib/commerce-settings.ts:21-23` order 1 vs 2 | OK |
| 2.7 Review section (replaces old brand position) | ✅ | `commerce-settings.ts:25`, `app/page.tsx:151-158` | OK |
| 2.8 Featured Brands logo grid/slider | ✅ | `FeaturedBrandsSlider.tsx`, `lib/brands-master.ts` | OK |
| 2.9 Brands Admin-editable (name, slug, logo, order, enabled) | ❌ | `lib/brands-master.ts` hardcoded | Add brands table/API; Admin Brands page CRUD; FeaturedBrandsSlider reads from provider |
| **PHASE 3 — PRODUCT PAGE** |
| 3.1 Buy Now: add variation + qty → checkout | ✅ | `ProductDetailContent.tsx:105-116` handleBuyNow | OK |
| 3.2 Buy Now idempotent (no duplicate on double click) | ⚠️ | `buyNowProcessing` set true/false; state update async | Add immediate disable + ref guard |
| 3.3 Buy Now validate inStock + variation | ✅ | `canBuyNow` checks product.inStock, selectedVariation.inStock | OK |
| 3.4 Buy Now toast + disable while processing | ⚠️ | Disable present; no toast | Add toast (or inline feedback) |
| 3.5 Remove secure payment under Add to Cart | ✅ | `ProductDetailContent.tsx` does not use SecurePaymentBadges | OK |
| **PHASE 4 — CHECKOUT** |
| 4.1 Coupon BEFORE payment methods | ✅ | `app/checkout/page.tsx:167-198` | OK |
| 4.2 Left: form; Right: order summary | ✅ | `lg:grid-cols-5`, `lg:col-span-3` form, `lg:col-span-2` summary | OK |
| 4.3 Payment tabs COD/Online | ⚠️ | Single select; no explicit tabs UI | Add tab-style UI if reference has tabs |
| 4.4 Mandatory Terms checkbox | ✅ | `checkoutSchema` acceptTerms, `checkout/page.tsx` | OK |
| 4.5 Zod + BD phone validation | ✅ | `lib/validations/checkout.ts` | OK |
| 4.6 Delivery charge preview (Inside/Outside Dhaka) | ✅ | `calculateCheckout`, zone from district | OK |
| 4.7 No layout shift, skeletons | ⚠️ | Delivery settings fetch has no skeleton | Add loading state |
| **PHASE 5 — REVIEW SYSTEM** |
| 5.1 Login required | ✅ | `app/api/reviews/route.ts` getUserId | OK |
| 5.2 Order dropdown (delivered only) | ✅ | `ProductReviewForm`, `/api/reviews/orders` | OK |
| 5.3 Server-side enforcement | ✅ | API validates order, delivered, product in order | OK |
| 5.4 Duplicate prevention (orderId+productId) | ✅ | `product_reviews` UNIQUE, API checks | OK |
| 5.5 Verified Purchase badge | ✅ | Reviews from delivered orders | OK |
| 5.6 Moderation (pending/approved) | ✅ | `product_reviews.status`, Admin Review Moderation page | OK |
| 5.7 review_eligible_days setting | ✅ | `site_settings.review_eligible_days`, migration 005 | OK |
| **PHASE 6 — TRACKING & COURIER** |
| 6.1 Track by Order ID OR Phone | ✅ | `app/api/track-order/route.ts`, `app/track-order/page.tsx` | OK |
| 6.2 BD phone validation | ✅ | `lib/phone-bd.ts`, `isValidBdPhone` | OK |
| 6.3 Admin setting: OTP for phone tracking | ❌ | No `require_otp_phone_tracking` | Add site_settings column + Admin toggle |
| 6.4 Realtime timeline (notes + status) | ⚠️ | Polling 10s; no Supabase Realtime subscription | Add Realtime on order_notes, order_status_events |
| 6.5 Admin add notes (public/private) | ❌ | No Admin UI to add order_notes | Add "Add note" in admin order detail |
| 6.6 Admin Server Health & Error Logs | ❌ | — | New Admin page: payment/courier/webhook errors |
| 6.7 Bulk order select + Bulk Book Courier | ✅ | `AdminOrdersClient.tsx`, `/api/admin/courier-booking` | OK |
| 6.8 Courier provider select | ✅ | Pathao/Steadfast/RedX in AdminOrdersClient | OK |
| 6.9 Admin courier settings (keys, enable) | ⚠️ | `courier_configs` table; `app/admin/courier` stub | Wire Admin courier page to courier_configs |
| **PHASE 7 — AUTH** |
| 7.1 Remove demo credentials from login UI | ✅ | Demo hint only when AUTH_MODE=demo AND NODE_ENV≠production | OK |
| 7.2 Demo mode only when env explicit | ✅ | `src/config/runtime.ts` defaults supabase in prod | OK |
| 7.3 Google/Facebook/Phone OTP login | ✅ | `app/login/LoginForm.tsx`, `/auth/callback`, `/api/auth/providers` | OK |
| 7.4 Admin auth provider toggles | ✅ | Admin Settings Integrations | OK |
| **PHASE 8 — ANALYTICS** |
| 8.1 Events Dashboard (ViewContent, AddToCart, etc.) | ✅ | `app/admin/analytics/page.tsx`, `/api/admin/analytics/events` | OK |
| 8.2 Server-side event capture | ✅ | `/api/analytics/events`, `captureEvent()` | OK |
| 8.3 event_id dedup | ✅ | API checks event_id before insert | OK |
| 8.4 Event Debug Panel | ⚠️ | Analytics page shows events table; no dedicated "Debug" panel | Add "Last N events" debug section or tab |
| 8.5 Meta Pixel + CAPI | ❌ | `site_settings` has fields; no client/server wiring | Add Meta Pixel script + CAPI server-side |
| 8.6 TikTok Pixel | ❌ | — | Add TikTok Events API if needed |
| 8.7 GTM | ✅ | `AnalyticsScripts.tsx`, `lib/analytics.ts` | OK |
| 8.8 Admin toggles for Meta/TikTok/GTM/CF | ⚠️ | Settings has fields; toggles need wiring to script loading | Wire toggles to conditional load |
| **PHASE 9 — ADMIN DASHBOARD** |
| 9.1 KPI cards, charts | ✅ | `AdminDashboardClient.tsx` | OK |
| 9.2 Drag & drop widget reorder | ❌ | — | Add react-beautiful-dnd or similar; persist to DB per user |
| 9.3 Orders "All Status" filter | ❌ | Admin orders has no filter dropdown | Add status filter |
| 9.4 Bulk assign + courier entry | ✅ | Bulk Book Courier in AdminOrdersClient | OK |
| **PHASE 10 — SEO + NO-ERROR** |
| 10.1 Metadata Home/Shop/Product/Category/Blog | ✅ | layout, generateMetadata | OK |
| 10.2 Canonicals | ✅ | NEXT_PUBLIC_SITE_URL in metadata | OK |
| 10.3 JSON-LD Product + Breadcrumb | ✅ | `ProductDetailContent.tsx:119-138` | OK |
| 10.4 sitemap.xml, robots.txt | ✅ | `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts` | OK |
| 10.5 No hydration warnings | ⚠️ | Login wrapped in Suspense; audit for others | Run dev, check console |
| 10.6 Loading/error boundaries | ⚠️ | Some pages have loading.tsx; not all | Add where missing |
| **HARDCODED VALUES** |
| H1 Delivery from settings | ✅ | `/api/checkout/settings`, `calculateCheckout` overrides | OK |
| H2 Voucher from API | ✅ | `/api/checkout/voucher` | OK |
| H3 WhatsApp number | ⚠️ | `FloatingUI.tsx:11` fallback `8801643390045` | Read from settings only |
| H4 Terms/Privacy links | ⚠️ | Checkout links; Admin-editable? | Add to site_settings if not |

---

## SITE AUDIT REPORT

### Storefront Audit
| Route | Status | Notes |
|-------|--------|-------|
| / | ✅ | Hero, blocks, Brands, Flash Sale, Reviews order correct |
| /shop | ✅ | Product grid |
| /product/[id] | ✅ | Detail, Buy Now, reviews; no SecurePaymentBadges |
| /cart | ✅ | CartSlideOver |
| /checkout | ✅ | Coupon first, form left, summary right |
| /order-complete | ✅ | Success page |
| /track-order | ✅ | Order ID + Phone search |
| /blog | ✅ | Blog list |
| /blog/[slug] | ✅ | Blog post |
| Policy pages | ✅ | terms, privacy, refund, etc. |

### Account Audit
| Route | Status | Notes |
|-------|--------|-------|
| /login | ✅ | Demo + Supabase providers |
| /register | ⚠️ | Placeholder? |
| /account | ✅ | Overview |
| /account/orders | ✅ | Orders list |
| /account/orders/[id] | ✅ | Order detail |
| /account/invoices | ✅ | |
| /account/returns | ✅ | |

### Admin Audit
| Route | Status | Notes |
|-------|--------|-------|
| /admin | ✅ | Dashboard |
| /admin/orders | ✅ | Bulk select, courier |
| /admin/orders/[id] | ⚠️ | No "Add note" UI |
| /admin/reviews | ✅ | Moderation |
| /admin/analytics | ✅ | Events table |
| /admin/courier | ⚠️ | Stub; needs config UI |
| /admin/settings | ✅ | Integrations, Auth providers |
| Other admin routes | ✅ | Products, categories, etc. |

### Issues to Fix
- **Runtime errors:** None observed from build
- **Console errors:** Audit in browser needed
- **Hydration warnings:** Login Suspense; check ProductDetail, Cart
- **Broken links:** Audit internal links
- **Settings missing:** OTP for phone tracking; Meta/TikTok toggles; brands CRUD
- **Hardcoded:** WhatsApp fallback; brands in lib
- **Performance:** Lazy load OK; ensure no blocking scripts
