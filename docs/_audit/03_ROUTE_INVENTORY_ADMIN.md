# Admin Route Inventory

**Generated:** March 1, 2026

---

## Auth & Guards

- **Middleware:** `middleware.ts` — Redirects unauthenticated to `/admin/login`. Checks JWT `role` (admin, adm, super_admin) or demo `demo_session` cookie.
- **API guards:** `lib/admin-auth.ts` — `requireAdminAuth()`, `requireAdminAuthAndPermission()`. Returns 401/403.

---

## Admin Routes (from adminSidebarConfig + menu API)

| Route | File | Backing APIs | DB Models |
|-------|------|--------------|-----------|
| `/admin` | `app/admin/page.tsx` | /api/admin/dashboard, /api/admin/menu | — |
| `/admin/login` | `app/admin/login/page.tsx` | NextAuth, /api/auth/demo-login | User, Session |
| `/admin/logout` | `app/admin/logout/page.tsx` | /api/admin/logout | — |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | /api/admin/dashboard | Order, Product |
| `/admin/home-banner-slides` | `app/admin/home-banner-slides/page.tsx` | /api/admin/home-banner-slides | HomeBannerSlide |
| `/admin/categories` | `app/admin/categories/page.tsx` | /api/admin/categories | Category |
| `/admin/categories/new` | `app/admin/categories/new/page.tsx` | /api/admin/categories | Category |
| `/admin/categories/[slug]/edit` | `app/admin/categories/[slug]/edit/page.tsx` | /api/admin/categories | Category |
| `/admin/products` | `app/admin/products/page.tsx` | /api/admin/products | Product |
| `/admin/products/new` | `app/admin/products/new/page.tsx` | /api/admin/products | Product |
| `/admin/products/[id]/edit` | `app/admin/products/[id]/edit/page.tsx` | /api/admin/products | Product |
| `/admin/products/upload` | `app/admin/products/upload/page.tsx` | /api/admin/products/import | Product |
| `/admin/products/bulk` | `app/admin/products/bulk/page.tsx` | /api/admin/products | Product |
| `/admin/products/bulk-import` | `app/admin/products/bulk-import/page.tsx` | /api/admin/products/import | Product |
| `/admin/products/rams` | `app/admin/products/rams/page.tsx` | /api/admin/product-rams | ProductRam |
| `/admin/products/weights` | `app/admin/products/weights/page.tsx` | /api/admin/product-weights | ProductWeight |
| `/admin/products/sizes` | `app/admin/products/sizes/page.tsx` | /api/admin/product-sizes | ProductSize |
| `/admin/products/units` | `app/admin/products/units/page.tsx` | /api/admin/units | — |
| `/admin/orders` | `app/admin/orders/page.tsx` | /api/admin/orders | Order |
| `/admin/orders/[id]` | `app/admin/orders/[id]/page.tsx` | /api/admin/orders, status, courier-booking | Order |
| `/admin/orders/create` | `app/admin/orders/create/page.tsx` | /api/admin/orders/create | Order |
| `/admin/orders/activities` | `app/admin/orders/activities/page.tsx` | /api/admin/orders/activities | OrderStatusEvent |
| `/admin/home-banners` | `app/admin/home-banners/page.tsx` | /api/admin/home-banners | HomeBanner |
| `/admin/home-side-banners` | `app/admin/home-side-banners/page.tsx` | /api/admin/home-side-banners | HomeSideBanner |
| `/admin/home-bottom-banners` | `app/admin/home-bottom-banners/page.tsx` | /api/admin/home-bottom-banners | HomeBottomBanner |
| `/admin/system-health` | `app/admin/system-health/page.tsx` | /api/admin/system-health | — |
| `/admin/event-debug` | `app/admin/event-debug/page.tsx` | /api/admin/event-debug | — |
| `/admin/settings` | `app/admin/settings/page.tsx` | /api/admin/settings | TenantSettings |
| `/admin/settings/integrations` | `app/admin/settings/integrations/page.tsx` | /api/admin/settings/secure-config | SecureConfig |
| `/admin/checkout-settings` | `app/admin/checkout-settings/page.tsx` | — | CheckoutSetting |
| `/admin/payments` | `app/admin/payments/page.tsx` | /api/admin/payment-gateways | PaymentGateway |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | /api/admin/analytics/events | Analytics |
| `/admin/analytics/live` | `app/admin/analytics/live/page.tsx` | /api/admin/analytics/live | LiveVisitor |
| `/admin/reports/orders` | `app/admin/reports/orders/page.tsx` | /api/admin/reports/orders | Order |
| `/admin/reports/expense` | `app/admin/reports/expense/page.tsx` | /api/admin/expenses | Expense |
| `/admin/reports` | `app/admin/reports/page.tsx` | — | — |
| `/admin/blog` | `app/admin/blog/page.tsx` | /api/admin/cms-pages | CmsPage |
| `/admin/blog/new` | `app/admin/blog/new/page.tsx` | /api/admin/cms-pages | CmsPage |
| `/admin/blog/[slug]/edit` | `app/admin/blog/[slug]/edit/page.tsx` | /api/admin/cms-pages | CmsPage |
| `/admin/pages` | `app/admin/pages/page.tsx` | /api/admin/cms-pages | CmsPage |
| `/admin/pages/new` | `app/admin/pages/new/page.tsx` | /api/admin/cms-pages | CmsPage |
| `/admin/pages/[id]/edit` | `app/admin/pages/[id]/edit/page.tsx` | /api/admin/cms-pages | CmsPage |
| `/admin/blog-categories` | `app/admin/blog-categories/page.tsx` | /api/admin/blog-categories | BlogCategory |
| `/admin/customers` | `app/admin/customers/page.tsx` | /api/admin/customers | Customer |
| `/admin/customers/repeat` | `app/admin/customers/repeat/page.tsx` | /api/admin/customers/repeat | Customer |
| `/admin/customers/risk` | `app/admin/customers/risk/page.tsx` | /api/admin/customers/risk | RiskScore |
| `/admin/vouchers` | `app/admin/vouchers/page.tsx` | /api/admin/vouchers | Voucher |
| `/admin/landing-pages` | `app/admin/landing-pages/page.tsx` | /api/admin/landing-pages | LandingPage |
| `/admin/landing-pages/[id]` | `app/admin/landing-pages/[id]/page.tsx` | /api/admin/landing-pages | LandingPage |
| `/admin/draft-orders` | `app/admin/draft-orders/page.tsx` | /api/admin/draft-orders | DraftOrder |
| `/admin/audit-logs` | `app/admin/audit-logs/page.tsx` | getAdminAuditLogs (provider) | AuditLog |
| `/admin/fraud` | `app/admin/fraud/page.tsx` | /api/admin/fraud, fraud/policy, fraud/review | FraudPolicy, FraudFlag |
| `/admin/courier` | `app/admin/courier/page.tsx` | /api/admin/courier-settings, courier-booking | CourierConfig |
| `/admin/team` | `app/admin/team/page.tsx` | — | UserRole, Role |
| `/admin/offers` | `app/admin/offers/page.tsx` | — | — |
| `/admin/ad-management` | `app/admin/ad-management/page.tsx` | /api/admin/ad-campaigns | CampaignPerformance |
| `/admin/global-ai` | `app/admin/global-ai/page.tsx` | — | — |
| `/admin/collections` | `app/admin/collections/page.tsx` | /api/admin/collections | Collection |
| `/admin/product-filters` | `app/admin/product-filters/page.tsx` | /api/admin/product-filters | ProductFilter |
| `/admin/shipping` | `app/admin/shipping/page.tsx` | — | TenantSettings |
| `/admin/attributes` | `app/admin/attributes/page.tsx` | — | Attribute |
| `/admin/product-tags` | `app/admin/product-tags/page.tsx` | — | ProductTag |
| `/admin/reviews` | `app/admin/reviews/page.tsx` | /api/admin/reviews | ProductReview |
| `/admin/inventory` | `app/admin/inventory/page.tsx` | — | InventoryLog |
| `/admin/messages` | `app/admin/messages/page.tsx` | — | SupportTicket |
| `/admin/invoices` | `app/admin/invoices/page.tsx` | — | — |
| `/admin/emails` | `app/admin/emails/page.tsx` | — | — |
| `/admin/tracking` | `app/admin/tracking/page.tsx` | — | TrackingEvent |
| `/admin/roles-permissions` | `app/admin/roles-permissions/page.tsx` | — | Role, Permission |
| `/admin/couriers` | `app/admin/couriers/page.tsx` | — | CourierConfig |
| `/admin/payment-methods` | `app/admin/payment-methods/page.tsx` | /api/admin/payment-gateways | PaymentGateway |
| `/admin/theme` | `app/admin/theme/page.tsx` | — | TenantSettings |
| `/admin/combo-offers` | `app/admin/combo-offers/page.tsx` | — | — |
| `/admin/advanced-settings` | `app/admin/advanced-settings/page.tsx` | — | TenantSettings |
| `/admin/status` | `app/admin/status/page.tsx` | — | — |
| `/admin/tools` | `app/admin/tools/page.tsx` | — | — |
| `/admin/users/new` | `app/admin/users/new/page.tsx` | — | User |

---

## Orphan Admin Pages (not in sidebar)

- `/admin/offers` — In adminSidebarConfig? No. **Orphan.**
- `/admin/status` — Not in sidebar. **Orphan.**
- `/admin/tools` — Not in sidebar. **Orphan.**
- `/admin/attributes` — Not in sidebar. **Orphan.**
- `/admin/product-tags` — Not in sidebar. **Orphan.**
- `/admin/inventory` — Not in sidebar. **Orphan.**
- `/admin/invoices` — Not in sidebar. **Orphan.**
- `/admin/emails` — Not in sidebar. **Orphan.**
- `/admin/tracking` — Not in sidebar. **Orphan.**
- `/admin/roles-permissions` — Not in sidebar (Team is). **Orphan** (or under Team).
- `/admin/couriers` — Not in sidebar (Courier is). **Possible duplicate** of /admin/courier.
- `/admin/payment-methods` — Not in sidebar (Payments is). **Possible duplicate.**
- `/admin/theme` — Not in sidebar. **Orphan.**
- `/admin/combo-offers` — Not in sidebar. **Orphan.**
- `/admin/advanced-settings` — Not in sidebar. **Orphan.**
- `/admin/reports` — Parent of orders/expense; may be index. **Check.**
- `/admin/dashboard` — Separate from /admin; both exist. **Check.**

---

## Admin Features Missing UI

- **Reminder** — Model exists; no admin page for reminders.
- **Conversation** — Model exists; Messages may cover it.
- **HomepageSection** — Model exists; no dedicated admin (homepage blocks in settings?).
- **ConversionTracking** — Model exists; no admin UI.
