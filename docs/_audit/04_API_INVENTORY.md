# API Inventory

**Generated:** March 1, 2026

---

## Public APIs (no auth)

| Endpoint | Methods | Runtime | Purpose | Used By |
|----------|---------|---------|---------|---------|
| `/api/health` | GET | default | Health check | Deploy, monitoring |
| `/api/status` | GET | default | Status | — |
| `/api/settings` | GET | default | Site settings | SiteSettingsProvider |
| `/api/settings/sales-top-bar` | GET | default | Sales bar | SlidingSalesBar |
| `/api/products/by-ids` | GET | default | Products by IDs | Cart, checkout |
| `/api/products/by-subcategory` | GET | default | Products by category | Shop |
| `/api/payment-gateways` | GET | default | Payment methods | Checkout |
| `/api/checkout/settings` | GET | default | Checkout config | Checkout |
| `/api/about` | GET | default | About content | About page |
| `/api/feeds/google` | GET | default | Google feed | — |
| `/api/feeds/meta` | GET | default | Meta feed | — |
| `/api/auth/mode` | GET | default | Auth mode | — |
| `/api/auth/providers` | GET | default | Auth providers | Login |
| `/api/auth/session` | GET | default | Session | — |
| `/api/auth/demo-login` | POST | default | Demo login | Admin demo |
| `/api/auth/demo-logout` | POST | default | Demo logout | Admin logout |
| `/api/auth/[...nextauth]` | * | default | NextAuth | Auth |
| `/api/auth/callback` | GET | default | OAuth callback | — |
| `/api/analytics/events` | POST | nodejs | Analytics event | AnalyticsScripts |
| `/api/analytics/heartbeat` | POST | default | Live visitor | LiveVisitorHeartbeat |
| `/api/track-order` | GET | default | Track by token | Track order page |
| `/api/track-order/send-otp` | POST | nodejs | Send OTP | Track order |
| `/api/track-order/verify-otp` | POST | default | Verify OTP | Track order |
| `/api/checkout/order` | POST | nodejs | Create order | Checkout |
| `/api/checkout/order/[id]/payment-status` | GET | default | Payment status | — |
| `/api/checkout/voucher` | POST | default | Validate voucher | Checkout |
| `/api/checkout/sslcommerz/init` | POST | default | SSLCommerz init | Checkout |
| `/api/reviews` | GET/POST | default | Product reviews | Product page |
| `/api/reviews/orders` | GET | default | Orders for review | — |
| `/api/invoice` | GET | default | Invoice | Account |
| `/api/draft-orders` | GET/POST | default | Draft orders | — |
| `/api/webhooks/sslcommerz` | POST | default | SSLCommerz webhook | Payment |
| `/api/webhooks` | POST | default | Generic webhook | — |
| `/api/media/[...path]` | GET | default | Media proxy | — |
| `/api/pixels/server` | GET | default | Pixel server | — |

---

## Admin APIs (requireAdminAuth)

| Endpoint | Methods | Purpose | Used By |
|----------|---------|---------|---------|
| `/api/admin/menu` | GET | Sidebar menu | AdminLayout |
| `/api/admin/dashboard` | GET | Dashboard stats | Admin dashboard |
| `/api/admin/dashboard-layout` | GET/PATCH | Layout config | — |
| `/api/admin/settings` | GET/PATCH | Tenant settings | Admin settings |
| `/api/admin/settings/secure-config` | GET/POST | Secure config | Integrations |
| `/api/admin/products` | GET/POST | Products CRUD | Products admin |
| `/api/admin/products/import` | POST | Bulk import | Product upload |
| `/api/admin/products/export` | GET | Export | — |
| `/api/admin/products/stock` | PATCH | Stock update | — |
| `/api/admin/categories` | GET/POST | Categories | Categories admin |
| `/api/admin/orders` | GET/POST | Orders | Orders admin |
| `/api/admin/orders/create` | POST | Create order | Create order |
| `/api/admin/orders/[id]/confirm` | POST | Confirm | Order detail |
| `/api/admin/orders/[id]/cancel` | POST | Cancel | Order detail |
| `/api/admin/orders/[id]/dispatch` | POST | Dispatch | Order detail |
| `/api/admin/orders/[id]/tags` | GET/POST | Order tags | Order detail |
| `/api/admin/orders/[id]/label` | GET | Label | — |
| `/api/admin/orders/status` | PATCH | Status change | Order detail |
| `/api/admin/orders/activities` | GET | Activities | Activities page |
| `/api/admin/order-notes` | POST | Add note | Order detail |
| `/api/admin/courier-booking` | GET/POST | Book courier | Order detail |
| `/api/admin/courier-booking/bulk` | POST | Bulk book | — |
| `/api/admin/courier-settings` | GET/PATCH | Courier config | Courier admin |
| `/api/admin/fraud` | GET/POST | Fraud flags, block IP | Fraud admin |
| `/api/admin/fraud/policy` | GET/PATCH | Fraud policy | Fraud admin |
| `/api/admin/fraud/review` | GET | Review queue | Fraud admin |
| `/api/admin/fraud/flags/[id]` | PATCH | Review flag | Fraud admin |
| `/api/admin/fraud/blocked/[id]` | DELETE | Unblock IP | Fraud admin |
| `/api/admin/vouchers` | GET/POST | Vouchers | Vouchers admin |
| `/api/admin/vouchers/[id]` | GET/PATCH/DELETE | Voucher | Vouchers admin |
| `/api/admin/cms-pages` | GET/POST | CMS pages | Blog, pages |
| `/api/admin/cms-pages/[id]` | GET/PATCH/DELETE | CMS page | — |
| `/api/admin/blog-categories` | GET/POST | Blog categories | Blog categories |
| `/api/admin/blog-categories/[id]` | GET/PATCH/DELETE | Blog category | — |
| `/api/admin/home-banner-slides` | GET/POST/PATCH | Banner slides | Home banners |
| `/api/admin/home-banners` | GET/POST/PATCH | Home banners | — |
| `/api/admin/home-side-banners` | GET/POST/PATCH | Side banners | — |
| `/api/admin/home-bottom-banners` | GET/POST/PATCH | Bottom banners | — |
| `/api/admin/about-founder` | GET/PATCH | Founder | About admin |
| `/api/admin/about-team` | GET/POST | Team | About admin |
| `/api/admin/about-team/[id]` | GET/PATCH/DELETE | Team member | — |
| `/api/admin/brands` | GET/POST | Brands | Brands admin |
| `/api/admin/brands/[id]` | GET/PATCH/DELETE | Brand | — |
| `/api/admin/collections` | GET/POST | Collections | Collections admin |
| `/api/admin/collections/[id]` | GET/PATCH/DELETE | Collection | — |
| `/api/admin/product-filters` | GET/POST | Product filters | — |
| `/api/admin/product-filters/[id]` | GET/PATCH/DELETE | Filter | — |
| `/api/admin/product-rams` | GET/POST | RAMs | — |
| `/api/admin/product-weights` | GET/POST | Weights | — |
| `/api/admin/product-sizes` | GET/POST | Sizes | — |
| `/api/admin/units` | GET/POST | Units | — |
| `/api/admin/units/[id]` | GET/PATCH/DELETE | Unit | — |
| `/api/admin/payment-gateways` | GET/PATCH | Payment gateways | Payments admin |
| `/api/admin/customers` | GET | Customers | Customers admin |
| `/api/admin/customers/[id]` | GET/PATCH | Customer | — |
| `/api/admin/customers/repeat` | GET | Repeat customers | — |
| `/api/admin/customers/risk` | GET | Customer risk | — |
| `/api/admin/customer-notes` | POST | Customer note | — |
| `/api/admin/draft-orders` | GET | Draft orders | Draft orders admin |
| `/api/admin/reviews` | GET/PATCH | Reviews | Reviews admin |
| `/api/admin/audit-logs` | GET | Audit logs | Audit logs page |
| `/api/admin/analytics/events` | GET | Analytics | Analytics admin |
| `/api/admin/analytics/live` | GET | Live visitors | Live admin |
| `/api/admin/reports/orders` | GET | Order report | Reports |
| `/api/admin/reports/sales` | GET | Sales report | — |
| `/api/admin/expenses` | GET/POST | Expenses | Expense admin |
| `/api/admin/ad-campaigns` | GET/POST | Ad campaigns | Ad management |
| `/api/admin/flash-sale` | GET/POST | Flash sale | — |
| `/api/admin/flash-sale/[id]` | GET/PATCH/DELETE | Flash sale rule | — |
| `/api/admin/landing-pages` | GET/POST | Landing pages | — |
| `/api/admin/landing-pages/[id]` | GET/PATCH/DELETE | Landing page | — |
| `/api/admin/landing-pages/[id]/blocks` | GET/POST | Blocks | — |
| `/api/admin/landing-pages/[id]/blocks/[blockId]` | GET/PATCH/DELETE | Block | — |
| `/api/admin/conversations` | GET/POST | Conversations | — |
| `/api/admin/conversations/[id]` | GET/PATCH | Conversation | — |
| `/api/admin/integrations/pathao/test` | POST | Test Pathao | Integrations |
| `/api/admin/system-health` | GET | System health | System health |
| `/api/admin/event-debug` | GET/POST | Event debug | Event debug |
| `/api/admin/upload` | POST | File upload | — |
| `/api/admin/logout` | POST | Admin logout | — |

---

## Unused APIs (no clear UI reference)

- `/api/status` — May be used by monitoring
- `/api/feeds/google`, `/api/feeds/meta` — Product feeds; may be cron/external
- `/api/draft-orders` — Storefront draft; check checkout
- `/api/webhooks` — Generic; may be fallback
- `/api/admin/dashboard-layout` — Check dashboard
- `/api/admin/orders/[id]/label` — PDF label?
- `/api/admin/conversations` — Messages admin?

---

## UI Calls to Missing Endpoints

- None identified. All admin pages have backing APIs or use provider functions.
