# City Plus Pet Shop — Implementation Map

**Generated:** March 1, 2026  
**Scope:** `/app`, `/app/api`, `/app/admin`, `/lib`, `prisma/schema.prisma`, `/docs`

---

## 1. Incomplete Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Search** | Partial | `/api/search` exists. Shop page uses `searchProducts()`. SearchStrip submits to `/shop?q=...`. Category filter in SearchStrip uses hardcoded `CATEGORIES`. |
| **Notifications/SMS** | Partial | `NotificationLog` exists. Email via Resend; SMS adapter (BulkSMS BD/Twilio) in `lib/notifications.ts`. |
| **Flash Sale Admin UI** | Missing | `/api/admin/flash-sale` exists. No admin page to create/manage FlashSaleRule. Storefront shows flash sale when `homepageBlocks` includes `flash_sale`. |
| **Inventory Logs Admin** | Complete | `/admin/inventory-logs` exists, in sidebar. |
| **Reminders Admin** | Complete | `/admin/reminders` exists, in sidebar. |
| **Homepage Blocks Admin** | Missing | `TenantSettings.homepageBlocks` stored via `/api/admin/settings`. No admin UI to reorder or enable/disable blocks. |
| **Legal Pages from CmsPage** | Partial | `/terms`, `/privacy`, `/refund` may use static content. CmsPage model exists for editable pages. |
| **Admin Notifications** | Placeholder | Admin page for notification templates (order confirmation, OTP) not fully implemented. |

---

## 2. Unused Prisma Models

| Model | Status | Notes |
|-------|--------|-------|
| **HomepageSection** | Unused | Schema exists; homepage uses `TenantSettings.homepageBlocks` (JSON). |
| **ConversionTracking** | Unused | Schema exists; no admin UI or code references. |

---

## 3. Orphan Admin Pages (Not in Sidebar)

| Route | File | Notes |
|-------|------|-------|
| `/admin/offers` | `app/admin/offers/page.tsx` | Orphan |
| `/admin/status` | `app/admin/status/page.tsx` | Orphan |
| `/admin/tools` | `app/admin/tools/page.tsx` | Orphan |
| `/admin/menus` | `app/admin/menus/page.tsx` | Edits navbar/footer; orphan |
| `/admin/about` | `app/admin/about/page.tsx` | Orphan |
| `/admin/attributes` | `app/admin/attributes/page.tsx` | Orphan |
| `/admin/product-tags` | `app/admin/product-tags/page.tsx` | Orphan |
| `/admin/inventory` | `app/admin/inventory/page.tsx` | Orphan (inventory-logs is in sidebar) |
| `/admin/invoices` | `app/admin/invoices/page.tsx` | Orphan |
| `/admin/emails` | `app/admin/emails/page.tsx` | Orphan |
| `/admin/tracking` | `app/admin/tracking/page.tsx` | Orphan |
| `/admin/roles-permissions` | `app/admin/roles-permissions/page.tsx` | Orphan |
| `/admin/couriers` | `app/admin/couriers/page.tsx` | Possible duplicate of `/admin/courier` |
| `/admin/payment-methods` | `app/admin/payment-methods/page.tsx` | Possible duplicate of `/admin/payments` |
| `/admin/theme` | `app/admin/theme/page.tsx` | Orphan |
| `/admin/combo-offers` | `app/admin/combo-offers/page.tsx` | Orphan |
| `/admin/advanced-settings` | `app/admin/advanced-settings/page.tsx` | Orphan |
| `/admin/brands` | `app/admin/brands/page.tsx` | Orphan |
| `/admin/flash-sale` | May not exist | Flash sale admin page missing |

---

## 4. Duplicate / Overlapping Routes

| Route Pair | Resolution |
|------------|------------|
| `/payment-failed` vs `/payment/failed` | `/payment-failed` redirects to `/payment/failed`. |
| `/admin/couriers` vs `/admin/courier` | Both exist; consolidate. |
| `/admin/payment-methods` vs `/admin/payments` | Both exist; consolidate. |

---

## 5. Missing Admin-Controlled Storefront Parts

| Part | Status | Notes |
|------|--------|-------|
| **Navbar links** | Partial | `TenantSettings.navbarLinks` (JSON). `/admin/menus` can edit; page is orphan. |
| **Footer links** | Partial | `TenantSettings.footerLinks` (JSON). `/admin/menus` can edit; page is orphan. |
| **Legal pages** | Hardcoded | Terms, Privacy, Refund use static or CmsPage. Need to ensure CmsPage-driven. |
| **Homepage blocks** | No admin UI | Stored in `TenantSettings.homepageBlocks`; not editable in admin. |
| **Flash sale rules** | No admin UI | API exists; no admin page. |

---

## 6. Prisma Schema — Indexes to Add

| Model | Field | Index |
|-------|-------|-------|
| Product | nameEn | @@index |
| Product | slug | (already @@unique with tenantId) |
| Order | (order_number) | Order has no order_number field; use id |
| Order | guestPhone | @@index exists |
| Category | slug | (already @@unique with tenantId) |

---

## 7. Recommended Actions (by Phase)

**Phase 2:** Add indexes; ensure db:setup/db:reset; update .env.example.  
**Phase 3:** Create `/admin/settings/storefront`; homepage builder UI; `/admin/menus` in sidebar; legal pages from CmsPage.  
**Phase 4:** Search API (done); inventory logs (done); notifications admin; rate limiting (done); flash sale admin UI.  
**Phase 5:** Orphan cleanup; duplicate route fixes; /site-map in footer (done); audit logging (done).  
**Phase 6:** Security headers, CSP, validation, file upload restrictions.
