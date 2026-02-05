# City Plus Pet Shop — Full Website Summary (A–Z)

Complete reference for every feature, route, component, data layer, and configuration in the project. No omissions.

---

## 1. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| UI / Forms | Radix UI (Dialog, Select, Tabs, etc.), React Hook Form, Zod |
| State | React Context: Cart, Compare, Wishlist, Products, Categories, SiteSettings, Offers, Vouchers, Blog |
| Data source | **Switchable:** `local` \| `supabase` \| `sanity` via `NEXT_PUBLIC_DATA_SOURCE` |
| CMS (optional) | Sanity.io — Studio at `/studio`, GROQ, next-sanity, ISR + revalidate tags |
| Backend (optional) | Supabase (Postgres, Auth, Storage) when `DATA_SOURCE=supabase` |
| Images | next/image via SafeImage; Sanity CDN when using Sanity |
| PDF | pdf-lib (invoices) |
| Email | Resend or SMTP (env + Admin config) |
| Animations | Framer Motion (home product grid, micro-interactions) |

---

## 2. Environment Variables

Copy `.env.local.example` to `.env.local`.

| Variable | Required when | Description |
|----------|----------------|-------------|
| `NEXT_PUBLIC_DATA_SOURCE` | Always | `local` (default) \| `supabase` \| `sanity` |
| `NEXT_PUBLIC_AUTH_MODE` | Always | `demo` (default) \| `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | DATA_SOURCE=supabase | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | DATA_SOURCE=supabase | Supabase anon key |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | DATA_SOURCE=sanity | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | DATA_SOURCE=sanity | Dataset (e.g. `production`) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Site URL for sitemap, canonical, OG |
| `RESEND_API_KEY` | Optional | Resend for transactional email |
| `SANITY_REVALIDATE_SECRET` | Optional | Secret for `/api/revalidate` webhook |
| `SANITY_API_READ_TOKEN` | Optional | Sanity read token (draft/preview) |

**Demo auth:** `admin@cityplus.local` / `Admin@12345` (admin), `user@cityplus.local` / `User@12345` (customer).

---

## 3. Data Layer

### 3.1 Provider (`src/data/provider.ts`)

Single entry point; branches on `DATA_SOURCE` and delegates to local, Supabase, or Sanity.

**Product:**  
`getProducts`, `getFeaturedProducts`, `getProductById`, `getProductBySlug`, `getRecommendedProducts(categorySlug, excludeId, limit)`, `getFlashSaleProducts(limit)`, `getClearanceProducts(limit)`.

**Content:**  
`getHomeData`, `getBlogPosts`, `getBlogPostBySlug`, `getComboOffers`.

**Admin demo:**  
`getAdminDashboard`, `getAdminOrders`, `getAdminOrderById`, `getAdminCustomers`, `getAdminVouchers`, `getAdminAuditLogs`.

**User account demo:**  
`getUserAccountOverview`, `getUserOrders`, `getUserOrderById`, `getUserInvoices`, `getUserReturns`.

**Data source behavior:**  
- **local:** `src/data/local/*` (products, categories, home, blog, comboOffers, adminDemo, userDemo).  
- **sanity:** Products, categories, home, combo offers from `src/data/sanity/*`; blog/admin fallback to local/Supabase.  
- **supabase:** `src/data/supabase/*` for all when set.

### 3.2 Types (`src/data/types.ts`)

- **Product:** id, slug, name, category, categorySlug, brand, price, comparePrice, rating, inStock, shortDesc, longDesc, images, image, tags, specs, seo, **variations**, **defaultVariationId**, **videoUrl**, **stockQuantity**.  
- **ProductVariation:** id, name, attribute, price, comparePrice, image, inStock.  
- **BlogPost:** slug, title, date, excerpt, coverImage, thumbnailImage, metaTitle, metaDescription, keywords, content, faq.  
- **Category:** slug, name, image, subcategories.  
- **Brand:** id, name, logo, slug.  
- **Offer:** id, title, description, discountType, discountValue, startDate, endDate, active, image, minPurchase.  
- **ComboOffer:** id, slug, title, description, image, price, comparePrice, productIds, href, cta.  
- **HomeSection:** heroSlides, featuredCategories, featuredBrands, flashSale, sideBanners.  
- **HeroSlide, FeaturedCategory, FlashSaleBanner.**  
- **Demo:** DemoOrder, DemoOrderItem, DemoCustomer, DemoVoucher, DemoAuditLog, DemoUserProfile, DemoInvoice, DemoReturn, DemoDashboard, DemoReportSummary, DemoReportSeries.

### 3.3 Sanity

- **Config:** `lib/sanity/config.ts` (env validation), `lib/sanity/client.ts` (createClient, sanityFetch with cache tags), `lib/sanity/image.ts` (urlForImage), `lib/sanity/queries.ts` (GROQ).  
- **Schemas (root `sanity/`):** product, category, siteSettings, comboOffer, blockContent, heroSlide.  
- **Studio:** `sanity/sanity.config.ts`, basePath `/studio`, Structure Tool + Vision.

---

## 4. Storefront Routes (Public)

| Route | Description |
|-------|-------------|
| `/` | **Homepage** — Hero slider, category sidebar, top seller card, promo banners, popular categories, **dynamic blocks** (Featured, Flash Sale, Clearance, Combo from storefront settings), featured brands, discount strip. |
| `/shop` | **Shop** — All products; **filters:** keyword (`q`), category, brand, price, rating (4+, 3+), stock; sort; pagination. Suspense + ShopFallback. |
| `/shop?category=...&q=...` | Shop with category and search query. |
| `/product/[id]` | **Product detail** — Gallery, **image zoom** (modal), **variations** (swatches, price/image update), price/compare, **LowStockBadge**, **DeliveryETA**, **SecurePaymentBadges**, quantity, Add to Cart / Buy Now / Compare, **wishlist heart**, description, **video** (if `videoUrl`), reviews with **VerifiedBuyerBadge**, **RecommendedProducts**, **RecentlyViewedProducts**. Loading: `ProductDetailSkeleton`. |
| `/category/[slug]` | **Category** — Products in category (CategoryClient). |
| `/cart` | **Cart** — Cart page; slide-over cart from header. |
| `/checkout` | **Checkout** — Shipping form, delivery zone (inside/outside Dhaka), voucher, payment method, place order. |
| `/order-complete` | Order success. |
| `/combo-offers` | Combo offers grid. |
| `/blog` | Blog list. |
| `/blog/[slug]` | Single blog post. |
| `/about`, `/about-us` | About. |
| `/contact`, `/contact-us` | Contact. |
| `/track-order` | Track order. |
| `/offers` | Offers. |
| `/compare` | Product comparison. |
| `/terms`, `/terms-conditions` | Terms. |
| `/privacy`, `/privacy-policy` | Privacy. |
| `/refund`, `/refund-return-policy` | Refund/return. |
| `/login`, `/register`, `/forgot-password`, `/logout` | Auth (demo or Supabase). |
| `/payment`, `/payment/success`, `/payment/failed`, `/payment-failed` | Payment flows. |
| `/entertainment` | Entertainment page. |
| `/dev/route-check` | Dev route check. |

### Redirects (next.config.js)

- `/my-account*` → `/account*`.

---

## 5. Customer Account Routes

| Route | Description |
|-------|-------------|
| `/account` | Account dashboard (and `/my-account` redirects). |
| `/account/orders` | Order list. |
| `/account/orders/[id]` | Order detail (OrderActions). |
| `/account/invoices` | Invoices. |
| `/account/returns` | Returns. |

---

## 6. Admin Dashboard Routes

Layout: sidebar (no store header/footer). **Content (Sanity CMS)** links to `/studio`.

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard (AdminDashboardClient). |
| `/admin/login`, `/admin/logout` | Admin auth. |
| `/admin/settings` | Site settings (store, theme, **homepage blocks** order/visibility, integrations, SEO). |
| `/admin/theme` | Theme. |
| `/admin/advanced-settings` | Advanced settings. |
| `/admin/tools` | Tools & plugins. |
| `/admin/products` | Product list. |
| `/admin/products/new` | New product. |
| `/admin/products/[id]/edit` | Edit product. |
| `/admin/products/bulk`, `/admin/products/bulk-import` | Bulk / CSV. |
| `/admin/categories`, `/admin/categories/new`, `/admin/categories/[slug]/edit` | Categories. |
| `/admin/attributes` | Attributes. |
| `/admin/product-tags` | Product tags. |
| `/admin/brands` | Brands. |
| `/admin/inventory` | Inventory. |
| `/admin/combo-offers` | Combo offers. |
| `/admin/orders`, `/admin/orders/[id]` | Orders. |
| `/admin/offers` | Offers. |
| `/admin/vouchers` | Vouchers. |
| `/admin/blog`, `/admin/blog/new`, `/admin/blog/[slug]/edit` | Blog. |
| `/admin/pages` | CMS pages. |
| `/admin/menus` | Menus. |
| `/admin/checkout-settings` | Checkout settings. |
| `/admin/payments`, `/admin/payment-methods` | Payment gateways. |
| `/admin/emails` | Email notifications. |
| `/admin/invoices` | PDF invoices. |
| `/admin/courier`, `/admin/couriers` | Courier. |
| `/admin/tracking` | Tracking. |
| `/admin/reports` | Reports. |
| `/admin/customers` | Customers (AdminCustomersClient). |
| `/admin/users/new` | Add user. |
| `/admin/roles-permissions` | Roles & permissions. |
| `/admin/audit-logs` | Audit logs. |
| `/admin/team` | Team. |
| `/admin/analytics` | Analytics. |

---

## 7. Sanity Studio

| Route | Description |
|-------|-------------|
| `/studio` | Embedded Sanity Studio (next-sanity). No store header/footer (StoreLayout skips chrome). |

When `DATA_SOURCE=sanity`: products, categories, home data, combo offers from Sanity; blog/admin demo from local or Supabase.

---

## 8. API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/products/by-ids` | GET | `?ids=id1,id2` — products by IDs (e.g. recently viewed). |
| `/api/revalidate` | POST | On-demand revalidation for Sanity webhooks; optional `?secret=`. |
| `/api/auth/demo-login`, `/api/auth/demo-logout` | POST | Demo auth. |
| `/api/webhooks` | POST | Generic webhook handler. |
| `/robots.txt` | GET | robots.txt route. |
| `/sitemap.xml` | GET | Sitemap route. |

---

## 9. Key Components

### Layout

- **StoreLayout** — Renders Header (TopBar, MainNavbar, SearchStrip), main, HomeFooter, CartSlideOver, FloatingUI. Skips chrome for `/admin` and `/studio`.
- **Header** — HeaderTopBar, MainNavbar, SearchStrip.

### Home

- **HeaderTopBar** — Top bar (contact, links).  
- **MainNavbar** — Main nav, logo, cart.  
- **SearchStrip** — Search bar.  
- **HeroSlider** — Hero carousel.  
- **CategorySidebar** — Category list.  
- **TopSellerCard** — Top seller highlight.  
- **PromoBanners** — Promo banners.  
- **PopularCategoryRow** — Popular categories.  
- **HomeProductGrid** — Renders dynamic blocks (Featured, Flash Sale, Clearance, Combo) from storefront settings; uses Framer Motion.  
- **HomeComboBlock** — Combo offers block.  
- **FeaturedBrandsSlider** — Brands slider.  
- **DiscountStrip** — Discount strip.  
- **HomeFooter** — Footer.

### Product

- **ProductCard** — Card with **wishlist heart** (useWishlist), discount badge, link.  
- **ProductDetailContent** — Gallery, zoom modal, variation swatches, trust badges, sticky CTA on mobile, video section, recommended + recently viewed.  
- **RecommendedProducts** — Same category, exclude current; from `getRecommendedProducts`.  
- **RecentlyViewedProducts** — From `lib/recently-viewed.ts` + `/api/products/by-ids`.  
- **SafeImage** — next/image with fallback and shimmer.  
- **Skeletons:** ProductCardSkeleton, ProductDetailSkeleton.

### Trust

- **LowStockBadge** — “Only X left” when stockQuantity &lt; threshold.  
- **DeliveryETA** — ETA copy from commerce-settings (inside/outside Dhaka).  
- **SecurePaymentBadges** — Payment trust badges.  
- **VerifiedBuyerBadge** — On reviews.

### Other

- **CartSlideOver** — Slide-over cart.  
- **FloatingUI** — Floating elements (e.g. back to top).  
- **AccountNav** — Account section nav.

---

## 10. Contexts & State

- **CartContext** — Cart items, add/remove/update, open/close slide-over.  
- **CompareContext** — Compare list.  
- **WishlistContext** — Wishlist (localStorage), add/remove/toggle.  
- **SiteSettingsContext** — Site settings from Supabase or defaults (includes `homepage_blocks`).  
- **ProductsContext** — Products for admin/storefront.  
- **CategoriesContext** — Categories (getCategoryBySlug, updateCategory, etc.).  
- **OffersContext** — Offers.  
- **VouchersContext** — Vouchers.  
- **BlogContext** — Blog posts.

---

## 11. Commerce & Config

### Checkout (`lib/checkout.ts`)

- **Delivery:** Inside Dhaka 70 BDT, Outside Dhaka 130 BDT (`DELIVERY_INSIDE_DHAKA`, `DELIVERY_OUTSIDE_DHAKA`).  
- **Types:** ShippingCity, CheckoutSummary.  
- **Functions:** getDeliveryCharge(city), calculateCheckout(subtotal, city, voucherDiscount).

### Commerce settings (`lib/commerce-settings.ts`)

- **HomepageBlockType:** featured, flash_sale, clearance, combo_offers.  
- **HomepageBlockConfig:** id, type, enabled, order, titleEn, titleBn, subtitle.  
- **DEFAULT_HOMEPAGE_BLOCKS** — Default block order and labels.  
- **DEFAULT_LOW_STOCK_THRESHOLD** — 10.  
- **DEFAULT_DELIVERY_ETA_INSIDE / OUTSIDE** — ETA copy.  
- **getOrderedHomepageBlocks(blocks)** — Normalize and sort; enabled only.

### Storefront settings (`lib/storefront-settings-server.ts`)

- **getStorefrontSettings()** — Reads homepage blocks (e.g. from Supabase) for storefront; used by homepage.

### Recently viewed (`lib/recently-viewed.ts`)

- **localStorage**, max 20; **addRecentlyViewed(id)** called on product view.

### Validations

- **lib/validations/checkout.ts** — Checkout form validation (Zod).

### PDF & content

- **lib/pdf-invoice.ts** — PDF invoice generation (pdf-lib).  
- **lib/content.ts** — Static content helpers.  
- **lib/schema.ts** — Site settings schema (homepage_blocks, etc.).

---

## 12. Auth

- **lib/auth.ts** — Auth helpers.  
- **src/auth/supabase/session.ts** — Supabase session when AUTH_MODE=supabase.  
- Demo: admin and customer credentials as above.

---

## 13. Build & Run

```bash
npm install
npm run dev    # Development
npm run build  # Production build
npm run start  # Production start
npm run lint
npm run typecheck
```

**First-time Sanity:** Set `NEXT_PUBLIC_DATA_SOURCE=sanity`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`. Run `npm install`. Open `/studio`, create Site Settings and content. Configure Sanity webhooks to call `/api/revalidate` for on-demand ISR.

**next.config.js:** Redirects `/my-account*` → `/account*`. **Images:** remotePatterns include `images.unsplash.com`, `placehold.co`, `cdn.sanity.io`. **Transpile:** next-sanity, sanity.

---

## 14. Summary Checklist (What Exists)

- **One codebase:** Storefront, account, admin, Sanity Studio.  
- **Three data modes:** local, Supabase, Sanity; no removal of existing features.  
- **Homepage:** Dynamic blocks (Featured, Flash Sale, Clearance, Combo) with order/enable from storefront settings.  
- **Product:** Variations, zoom, video, trust elements, wishlist, recently viewed, recommended.  
- **Shop:** Keyword + filters (category, brand, price, rating, stock), sort, pagination, Suspense.  
- **Checkout:** Shipping, delivery zone, voucher, payment, place order.  
- **Admin:** Full dashboard; link to Sanity at `/studio`; homepage block config in settings.  
- **Sanity:** Optional CMS with validated config, ISR tags, revalidate API.  
- **Account:** Orders, invoices, returns.  
- **API:** by-ids, revalidate, demo auth, webhooks, robots, sitemap.

This document is the single full A–Z summary of the City Plus Pet Shop website. Everything listed exists in the project.
