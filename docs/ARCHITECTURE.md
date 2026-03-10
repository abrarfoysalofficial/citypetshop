# City Plus Pet Shop — Architecture Document

**Version:** 1.0  
**Last Updated:** February 28, 2026  
**Project:** citypetshop.bd

---

## 1. High-Level Overview

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | Next.js 14 (App Router) | Storefront + Admin in single app |
| **Backend** | Next.js API Routes | No separate NestJS; API under `/api` |
| **Database** | PostgreSQL + Prisma ORM | Self-hosted, no Supabase |
| **Auth** | NextAuth.js (Credentials) | JWT + session, RBAC |
| **Cache** | Redis (ioredis) | Optional; cart, rate-limit, OTP |
| **Courier** | Steadfast, Pathao | Via `lib/courier/` |
| **Payment** | COD, Wallet, SSLCommerz | Webhook idempotency |

---

## 2. Domain & Routing (Current vs Plan)

| Plan Requirement | Current Implementation | Status |
|------------------|------------------------|--------|
| citypetshop.bd (primary) | `NEXT_PUBLIC_SITE_URL` configurable | ✅ |
| www.citypetshop.bd → 301 | Not in Next.js; DNS/VPS config | ⚠️ External |
| admin.citypetshop.bd | Same domain `/admin` | ⚠️ Subdomain not used |
| api.citypetshop.bd | Same domain `/api` | ⚠️ Subdomain not used |

---

## 3. App Layer Structure

### 3.1 Storefront Routes (`app/`)

| Route | Purpose |
|-------|---------|
| `/` | Home (hero, categories, featured) |
| `/shop` | Product grid + filters |
| `/shop/[category]/[subcategory]/[product]` | Product detail (canonical) |
| `/category/[slug]` | Category listing |
| `/cart` | Cart page |
| `/checkout` | Checkout flow |
| `/checkout/success` | Thank you page |
| `/account` | Customer account |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail |
| `/account/invoices` | Invoices |
| `/account/returns` | Returns |
| `/about` | About page |
| `/about-us` | Alias |
| `/contact` | Contact page |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post |
| `/track-order` | Order tracking (phone/OTP) |
| `/offers` | Special offers |
| `/combo-offers` | Combo offers |
| `/compare` | Product compare |
| `/privacy` | Privacy policy |
| `/terms` | Terms & conditions |
| `/503` | Maintenance / demo-mode redirect |

### 3.2 Admin Routes (`app/admin/`)

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard |
| `/admin/login` | Admin login |
| `/admin/products` | Product CRUD |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management |
| `/admin/customers` | Customer list |
| `/admin/courier` | Courier settings |
| `/admin/couriers` | Courier config |
| `/admin/payment-methods` | Payment config |
| `/admin/checkout-settings` | Checkout config |
| `/admin/blog` | Blog CMS |
| `/admin/home-banner-slides` | Hero slider |
| `/admin/home-banners` | Banners |
| `/admin/settings` | Tenant settings |
| `/admin/advanced-settings` | Secure config |
| `/admin/analytics` | Analytics |
| `/admin/fraud` | Fraud flags |
| `/admin/audit-logs` | Audit logs |
| `/admin/landing-pages` | Landing page builder |
| `/admin/about` | About page editor |
| ... | (50+ admin routes) |

### 3.3 API Routes (`app/api/`)

| Prefix | Purpose |
|--------|---------|
| `/api/auth/*` | NextAuth, demo login, session |
| `/api/checkout/*` | Order create, voucher, SSLCommerz |
| `/api/products/*` | Product listing, by-ids |
| `/api/settings` | Public storefront settings |
| `/api/reviews/*` | Reviews |
| `/api/track-order/*` | OTP send/verify, track |
| `/api/admin/*` | Admin CRUD (products, orders, etc.) |
| `/api/feeds/*` | Google/Meta product feeds |
| `/api/health` | Health check |
| `/api/webhooks/sslcommerz` | Payment webhook |
| `/api/pixels/server` | Server-side pixel |
| `/api/invoice` | Invoice generation |

---

## 4. Modules & Services

### 4.1 Store (Context Providers)

| Provider | Path | Purpose |
|----------|------|---------|
| `SiteSettingsProvider` | `store/SiteSettingsContext.tsx` | Site config, theme |
| `ProductsProvider` | `store/ProductsContext.tsx` | Product data |
| `CategoriesProvider` | `store/CategoriesContext.tsx` | Categories |
| `OffersProvider` | `store/OffersContext.tsx` | Offers |
| `VouchersProvider` | `store/VouchersContext.tsx` | Vouchers |
| `CartProvider` | `store/CartContext.tsx` | Cart state |
| `CompareProvider` | `store/CompareContext.tsx` | Compare |
| `WishlistProvider` | `store/WishlistContext.tsx` | Wishlist |
| `BlogProvider` | `store/BlogContext.tsx` | Blog |

### 4.2 Services

| Service | Path | Purpose |
|---------|------|---------|
| `BaseTenantService` | `services/BaseTenantService.ts` | Tenant-scoped base |
| (Sparse) | `services/` | Minimal; logic in lib/ |

### 4.3 Lib (Core Logic)

| Module | Path | Purpose |
|--------|------|---------|
| `db` | `lib/db.ts` | Prisma client |
| `auth` | `lib/auth.ts` | NextAuth config |
| `tenant` | `lib/tenant.ts` | Tenant resolution |
| `checkout` | `lib/checkout.ts` | Checkout logic |
| `order-transitions` | `lib/order-transitions.ts` | Order status flow |
| `sslcommerz` | `lib/sslcommerz.ts` | SSLCommerz |
| `secure-config-loader` | `lib/secure-config-loader.ts` | Encrypted secrets |
| `courier/*` | `lib/courier/` | Steadfast, Pathao |
| `fraud` | `lib/fraud.ts` | Fraud scoring |
| `rate-limit` | `lib/rate-limit.ts` | Rate limiting |
| `redis` | `lib/redis.ts` | Redis client |
| `analytics` | `lib/analytics.ts` | Event tracking |
| `notifications` | `lib/notifications.ts` | Email/SMS |
| `rbac` | `lib/rbac.ts` | Role permissions |

---

## 5. Database (Prisma Schema)

### 5.1 Core Models

| Model | Purpose |
|-------|---------|
| `Tenant` | Multi-tenant org |
| `TenantSettings` | Site config, colors, banners |
| `User` | Auth (NextAuth credentials) |
| `Account`, `Session` | NextAuth OAuth/session |
| `Category` | Product categories |
| `Product` | Products |
| `ProductVariant` | Variants (size, weight, etc.) |
| `ProductImage` | Product images |
| `Order` | Orders |
| `OrderItem` | Order line items |
| `Voucher` | Coupons |
| `PaymentGateway` | Gateway config |
| `PaymentWebhookLog` | Idempotency |
| `NotificationLog` | Email/SMS log |
| `CourierBookingLog` | Courier idempotency |
| `ProductReview` | Reviews |
| `CmsPage` | Blog, pages |
| `BlogCategory` | Blog categories |
| `HomeBannerSlide` | Hero slider |
| `HomeBanner`, `HomeSideBanner`, `HomeBottomBanner` | Banners |
| `SecureConfig` | Encrypted secrets |
| `AuditLog` | Admin audit |
| `SupportTicket`, `TicketMessage` | Support |
| `LandingPage`, `LandingBlock` | Landing builder |
| `Customer`, `CustomerNote` | CRM |
| `Reminder`, `ReminderLog` | Reminders |
| `DraftOrder` | Incomplete checkout |
| `FraudPolicy`, `FraudFlag`, `BlockedIp`, `RiskScore` | Fraud |
| `TrackOtpVerification`, `TrackVerifiedToken` | Track OTP |
| `AboutPageProfile`, `TeamMember` | About page |

### 5.2 Enums

- `OrderStatus`: draft, pending, processing, shipped, handed_to_courier, delivered, cancelled, returned, refund_requested, refunded, failed
- `PaymentStatus`: pending, paid, failed, cancelled, refunded
- `ReviewStatus`: pending, approved, rejected

---

## 6. Admin Portal

- **Layout:** `app/admin/AdminLayout.tsx`, `AdminDashboardClient.tsx`
- **Auth:** NextAuth credentials; roles: admin, adm, super_admin
- **RBAC:** `lib/rbac.ts`; permissions via `Permission`, `Role`, `UserRole`
- **Secure Config:** AES-256-GCM encrypted; keys in `SecureConfig`

---

## 7. Build & Deploy

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production start |
| `npx prisma migrate deploy` | DB migrations |
| `npx prisma db seed` | Seed data |
| `npm run db:studio` | Prisma Studio |

---

## 8. Environment Variables (Summary)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL |
| `NEXTAUTH_SECRET` | Yes | Auth |
| `NEXTAUTH_URL` | Prod | Auth URL |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical, sitemap |
| `REDIS_URL` | Optional | Cache, rate-limit |
| `RESEND_API_KEY` | Optional | Emails |
| `SSLCOMMERZ_*` | Optional | Payment (or Admin) |
| `NEXT_PUBLIC_GTM_ID` | Optional | GTM |
| `CSP_ALLOW_UNSAFE_EVAL` | Optional | CSP |

---

## 9. Key Design Decisions

1. **Monolith:** Storefront + Admin + API in one Next.js app (plan suggested NestJS backend).
2. **Multi-tenant:** Tenant model; tenant-scoped products, orders, settings.
3. **No OTP at checkout:** Plan specifies 11-digit BD phone only; OTP only for track-order.
4. **Steadfast:** Primary courier; Pathao also supported.
5. **Secure Config:** Sensitive keys (Steadfast, SSLCommerz) in encrypted `SecureConfig`.
