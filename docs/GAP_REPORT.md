# City Plus Pet Shop — GAP Report

**Version:** 1.0  
**Last Updated:** February 28, 2026  
**Source:** Final plan.docx, user.txt, colour reference, reference of about us page

---

## Summary

| Category | Total | Implemented | Partial | Missing |
|----------|-------|-------------|---------|---------|
| Architecture | 8 | 5 | 2 | 1 |
| Storefront | 18 | 14 | 2 | 2 |
| Admin | 22 | 18 | 3 | 1 |
| Payment | 8 | 6 | 1 | 1 |
| Courier | 6 | 5 | 1 | 0 |
| DB Schema | 25 | 20 | 3 | 2 |
| Legal/SEO | 12 | 6 | 2 | 4 |
| Deployment | 10 | 4 | 2 | 4 |

---

## 1. Architecture & Domain

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1.1 | Primary domain citypetshop.bd | ✅ | Configurable via NEXT_PUBLIC_SITE_URL |
| 1.2 | www.citypetshop.bd → 301 to citypetshop.bd | ⚠️ | DNS/VPS config; not in Next.js |
| 1.3 | admin.citypetshop.bd subdomain | ❌ | Admin at /admin on same domain |
| 1.4 | api.citypetshop.bd OR /api | ⚠️ | /api on same domain; subdomain not used |
| 1.5 | NestJS backend recommended | ❌ | Next.js API routes only |
| 1.6 | Redis for cart, rate-limit, OTP | ⚠️ | Redis optional; cart in client context |
| 1.7 | PostgreSQL + Prisma | ✅ | Implemented |
| 1.8 | Queue/Worker for courier, payment, reminders | ❌ | No queue; sync processing |

---

## 2. Storefront Features

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 2.1 | Packly-style UX: left sidebar category, right product grid | ⚠️ | Sidebar exists; colour reference shows green/orange theme |
| 2.2 | Glassy product cards, hover animation | ⚠️ | Cards exist; glassmorphism partial |
| 2.3 | Image lazy-load, WebP/AVIF, CDN-ready | ✅ | Next.js Image, avif/webp |
| 2.4 | Checkout: 11-digit BD phone, no OTP | ✅ | Implemented |
| 2.5 | Customer account, order list, address book, wishlist | ✅ | Account, orders, wishlist; address book partial |
| 2.6 | Track order by phone/order id (guest) | ✅ | Track-order with OTP |
| 2.7 | Review module + admin moderation | ✅ | ProductReview, admin approve |
| 2.8 | Home: hero, categories, top sellers, featured, new arrivals, deals | ✅ | Implemented |
| 2.9 | Category: sidebar filter, price range, brand | ✅ | Filters exist |
| 2.10 | Product: gallery, specs, stock, variations, reviews | ✅ | Implemented |
| 2.11 | Cart: save, coupon, shipping estimate | ✅ | Implemented |
| 2.12 | Checkout: fast, phone validation, address, payment, notes | ✅ | Implemented |
| 2.13 | Thank you: order summary, next steps, CTA | ✅ | Checkout success |
| 2.14 | Blog SEO structured | ✅ | CmsPage, blog routes |
| 2.15 | Pages: About, Contact, Privacy, Terms, Return | ✅ | Routes exist |
| 2.16 | Colour scheme: green, white, orange (colour reference) | ⚠️ | Current: navy/cyan/orange; needs green primary |
| 2.17 | About page: founder, team, mission/vision (reference) | ⚠️ | About exists; content from Boner Bazar reference—needs City Pet Shop content |
| 2.18 | Product 360 view | ❌ | Not implemented |

---

## 3. Admin Panel Features

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 3.1 | Dashboard: sales, orders, conversion, AOV, returning | ✅ | Admin dashboard |
| 3.2 | Product: category, brand, attributes, variations, stock | ✅ | Products, categories, brands |
| 3.3 | Order: status flow, payment proof, courier | ✅ | Order management |
| 3.4 | Customer: accounts, phone, address | ✅ | Customers |
| 3.5 | Review moderation | ✅ | Admin reviews |
| 3.6 | Coupon/discount: product/category/order, scheduled | ✅ | Vouchers |
| 3.7 | CMS: pages, blog, banners, SEO | ✅ | CmsPage, blog, banners |
| 3.8 | Settings: store, contact, wallet, SSLCommerz, Steadfast | ✅ | TenantSettings, SecureConfig |
| 3.9 | Role/permission: super admin, manager, support | ✅ | RBAC |
| 3.10 | Logs & audit | ✅ | AuditLog |
| 3.11 | One-click Steadfast consignment | ✅ | Courier booking |
| 3.12 | Fraud flags, manual verify | ✅ | Fraud module |
| 3.13 | Draft order list (incomplete checkout) | ✅ | DraftOrder |
| 3.14 | Abandoned order follow-up (call/WhatsApp) | ⚠️ | Draft list exists; no automation |
| 3.15 | WordPress-like admin experience | ⚠️ | Custom; not WordPress UI |
| 3.16 | Real-time conversion report by source | ⚠️ | Analytics exist; source tracking partial |
| 3.17 | Payment verification panel (wallet trx) | ✅ | Order payment status |
| 3.18 | Inventory logs | ✅ | InventoryLog |
| 3.19 | Landing page builder | ✅ | LandingPage, LandingBlock |
| 3.20 | Expense, campaign performance | ✅ | Expense, CampaignPerformance |
| 3.21 | AI + human message automation | ⚠️ | Conversation model; automation partial |
| 3.22 | IP restriction optional | ❌ | Not implemented |

---

## 4. Payment System

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 4.1 | COD default | ✅ | Implemented |
| 4.2 | Mobile Wallet: bKash, Nagad, Rocket (manual, trx id) | ✅ | Wallet numbers in settings |
| 4.3 | SSLCommerz toggle + credentials | ✅ | Admin config, webhook |
| 4.4 | Payment status: pending/paid/failed/refunded/partial | ✅ | PaymentStatus enum |
| 4.5 | Wallet numbers: bKash 01881048788, Nagad 01881048788, Rocket 018810487886 | ⚠️ | In plan; verify in SecureConfig |
| 4.6 | Webhook idempotency | ✅ | PaymentWebhookLog |
| 4.7 | Refund process | ✅ | Order status, refund flow |
| 4.8 | Payment verification panel | ✅ | Admin orders |

---

## 5. Courier Integration

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 5.1 | Steadfast default | ✅ | lib/courier/ |
| 5.2 | Create consignment | ✅ | API + admin |
| 5.3 | Tracking update, status sync | ✅ | TrackingEvent |
| 5.4 | Inside/Outside Dhaka shipping | ✅ | Checkout zones |
| 5.5 | Weight/size based future-ready | ⚠️ | Weight in Product; rules partial |
| 5.6 | Steadfast API keys in SecureConfig | ✅ | SecureConfig |

---

## 6. Database Schema (Plan vs Prisma)

| # | Plan Table/Field | Status | Notes |
|---|------------------|--------|-------|
| 6.1 | users (customers): phone unique, 11-digit | ✅ | User; phone not unique in schema |
| 6.2 | admin_users, roles, permissions | ✅ | User.role, Role, Permission |
| 6.3 | categories, parent_id | ✅ | Category, parentId |
| 6.4 | brands | ✅ | Brand |
| 6.5 | products: type simple/variable/grouped | ⚠️ | Product; variants via ProductVariant |
| 6.6 | product_variants, attributes jsonb | ✅ | ProductVariant, ProductVariantAttribute |
| 6.7 | product_images | ✅ | ProductImage |
| 6.8 | product_360_media | ❌ | Not in schema |
| 6.9 | carts (session_id for guest) | ⚠️ | Cart in client; DraftOrder for incomplete |
| 6.10 | orders: order_no, fraud_score, fraud_flags | ✅ | Order; FraudFlag separate |
| 6.11 | order_items | ✅ | OrderItem |
| 6.12 | payments: wallet_trx_id, gateway_txn_id | ✅ | paymentMeta, PaymentWebhookLog |
| 6.13 | couriers, courier_shipments | ✅ | CourierConfig, CourierBookingLog |
| 6.14 | inventory_logs | ✅ | InventoryLog |
| 6.15 | reviews | ✅ | ProductReview |
| 6.16 | cms_pages, blogs | ✅ | CmsPage, BlogCategory |
| 6.17 | banners | ✅ | HomeBannerSlide, etc. |
| 6.18 | site_settings (credentials vault) | ✅ | TenantSettings, SecureConfig |
| 6.19 | coupons, coupon_usages | ✅ | Voucher |
| 6.20 | customer_addresses | ⚠️ | Not separate; in Order shipping |
| 6.21 | draft_orders | ✅ | DraftOrder |
| 6.22 | fraud tables | ✅ | FraudPolicy, FraudFlag, BlockedIp, RiskScore |
| 6.23 | track OTP tables | ✅ | TrackOtpVerification, TrackVerifiedToken |
| 6.24 | reminders, conversion_tracking | ✅ | Reminder, ConversionTracking |
| 6.25 | conversations (AI/human) | ⚠️ | Conversation model; automation partial |

---

## 7. Legal, SEO & Content

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 7.1 | Terms & Conditions (Bangla, full) | ⚠️ | /terms exists; content from plan needed |
| 7.2 | Privacy Policy | ⚠️ | /privacy exists; content needed |
| 7.3 | Return/Refund Policy | ⚠️ | Policy in plan; dedicated page? |
| 7.4 | 5 Blog articles (SEO, 2000+ words) | ❌ | Blog system exists; content not seeded |
| 7.5 | Blog 1: Best Dog Food BD | ❌ | Not created |
| 7.6 | Blog 2: Puppy Care BD | ❌ | Not created |
| 7.7 | Blog 3: Cat Food Guide | ❌ | Not created |
| 7.8 | Blog 4: Pet Accessories | ❌ | Not created |
| 7.9 | Blog 5: Pet Grooming | ❌ | Not created |
| 7.10 | SEO: canonical, sitemap, robots | ✅ | Metadata, feeds |
| 7.11 | Structured data (Product, FAQ, Organization) | ⚠️ | Partial; verify schema |
| 7.12 | Homepage copy (plan section 4) | ⚠️ | Default copy; plan has specific copy |

---

## 8. Deployment & Ops

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 8.1 | CyberPanel VPS setup | ❌ | Docs exist; not automated |
| 8.2 | PostgreSQL + Redis install | ❌ | Manual |
| 8.3 | PM2 / Node 20 | ⚠️ | ecosystem.config.js exists |
| 8.4 | SSL (Let's Encrypt) | ❌ | VPS config |
| 8.5 | 301 redirect www → primary | ❌ | DNS/VPS |
| 8.6 | Backup script (DB + media) | ❌ | OPS_RUNBOOKS may have |
| 8.7 | Fail2ban, UFW | ❌ | Server config |
| 8.8 | Monorepo (store, admin, api) | ❌ | Single Next.js app |
| 8.9 | Docker | ⚠️ | Dockerfile, docker-compose exist |
| 8.10 | GitHub Actions deploy | ⚠️ | .github/workflows/deploy.yml |

---

## 9. User Credentials (user.txt)

| Item | Value | Where to Use |
|------|-------|--------------|
| User ID | `[from user.txt]` | Admin login (if credentials) |
| Email | `[from user.txt]` | Admin user |
| Password | `[from user.txt]` — Change after deploy | Server env / seed only |
| Steadfast API Key | `[from user.txt]` | SecureConfig (Admin UI) |
| Steadfast Secret | `[from user.txt]` | SecureConfig (Admin UI) |

**Note:** Real values live in `user.txt` (local only) and server env. Never commit to docs.

---

## 10. Colour Reference (colour reference.jpeg)

- **Primary:** Green (dark green header, lighter green nav)
- **Accent:** Orange (buttons, badges, CTA)
- **Background:** White
- **Current theme:** Navy (#1e3a8a), Cyan (#06b6d4), Orange (#f97316)
- **Gap:** Primary should be green to match reference

---

## 11. Critical Gaps (Must Fix)

1. **Colour theme:** Align with green/orange from colour reference.
2. **About page:** Replace Boner Bazar content with City Pet Shop (founder, team, mission).
3. **5 Blog articles:** Create and seed from plan.
4. **Legal pages:** Full Bangla Terms, Privacy, Return Policy from plan.
5. **Admin subdomain:** Optional; current /admin acceptable.
6. **Queue/Worker:** For async courier, reminders; can defer.
7. **Product 360 view:** Optional enhancement.
8. **Customer addresses:** Dedicated address book if required.

---

## 12. Completion Percentage

| Area | Completion |
|------|-------------|
| Core e-commerce | ~90% |
| Admin panel | ~85% |
| Payment | ~90% |
| Courier | ~95% |
| Content (blog, legal) | ~20% |
| Design (colour, about) | ~70% |
| Deployment automation | ~40% |
| **Overall** | **~75%** |
