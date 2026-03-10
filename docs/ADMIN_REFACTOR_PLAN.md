# Admin Refactor Plan — City Pet Shop BD

## 1. Current Findings Summary

### Categories
- **Admin CRUD:** `/admin/categories`, `/admin/categories/new`, `/admin/categories/[slug]/edit` exist and use Prisma Category.
- **Problem:** Frontend uses `MASTER_CATEGORIES` (lib/categories-master.ts) — hardcoded 122-line array. Product form, CategoryMegaMenu, CategorySidebar, PopularCategoryRow, category-meta, sitemap, Navbar, Footer all use hardcoded or mixed sources.
- **API:** `/api/categories` (public) and `/api/admin/categories` (admin) both use Prisma. `/api/products/by-subcategory` uses `getSubcategoryByFullSlug` from MASTER_CATEGORIES.
- **Schema:** Single Category model with `parentId`; supports parent/child. Max depth not enforced in code.

### Banners
- **Four separate admin pages:** home-banner-slides, home-banners, home-side-banners, home-bottom-banners.
- **Four separate APIs:** /api/admin/home-banner-slides, home-banners, home-side-banners, home-bottom-banners.
- **Four Prisma models:** HomeBannerSlide, HomeBanner, HomeSideBanner, HomeBottomBanner.
- **Storefront:** provider-db getHomeData reads TenantSettings.heroSlider (JSON) first, then HomeBannerSlide as fallback. Side/bottom banners from admin models are NOT used by storefront. PromoBanners uses hardcoded array.
- **TenantSettings:** heroSlider, sideBanners (JSON) — separate from the 4 banner tables.

### Settings
- **Admin:** /admin/settings, /admin/settings/tracking, security, homepage, integrations, checkout-settings.
- **API:** /api/admin/settings (full), /api/settings (public, no secrets), /api/settings/sales-top-bar (separate).
- **Problem:** sales-top-bar is a separate endpoint; storefront may read from multiple sources. SlidingSalesBar has DEFAULT_TEXT fallback.

### Membership
- **None found.** No membership models, routes, or references in codebase.

### Orphan / Duplicate Routes (to remove per spec)
- /admin/offers, /admin/status, /admin/tools, /admin/theme
- /admin/advanced-settings, /admin/combo-offers
- /admin/attributes (unless required by product flow)
- /admin/product-tags, /admin/inventory, /admin/invoices
- /admin/emails, /admin/tracking
- /admin/reminders, /admin/event-debug (event-debug keep for dev?)

---

## 2. Route Keep/Remove Matrix

| Route | Decision | Reason |
|-------|----------|--------|
| /admin | KEEP | Dashboard |
| /admin/login | KEEP | Auth |
| /admin/categories | KEEP | Core |
| /admin/categories/new | KEEP | Core |
| /admin/categories/[slug]/edit | KEEP | Core |
| /admin/products | KEEP | Core |
| /admin/products/new | KEEP | Core |
| /admin/products/[id]/edit | KEEP | Core |
| /admin/products/upload | KEEP | Core |
| /admin/orders | KEEP | Core |
| /admin/orders/create | KEEP | Core |
| /admin/orders/[id] | KEEP | Core |
| /admin/brands | KEEP | Core |
| /admin/settings | KEEP | Core |
| /admin/settings/tracking | KEEP | Tracking pixels |
| /admin/settings/security | KEEP | Security |
| /admin/settings/homepage | KEEP | Homepage blocks |
| /admin/settings/integrations | KEEP | Integrations |
| /admin/checkout-settings | KEEP | Checkout |
| /admin/users | KEEP | Users (if exists) |
| /admin/team | KEEP | Team |
| /admin/roles-permissions | KEEP | RBAC |
| /admin/system-health | KEEP | Health |
| /admin/audit-logs | KEEP | Audit |
| /admin/blog | KEEP | Blog |
| /admin/blog-categories | KEEP | Blog |
| /admin/pages | KEEP | CMS |
| /admin/banners | **CREATE** | Unified banner page |
| /admin/home-banner-slides | **REMOVE → redirect** | Merge into /admin/banners |
| /admin/home-banners | **REMOVE → redirect** | Merge into /admin/banners |
| /admin/home-side-banners | **REMOVE → redirect** | Merge into /admin/banners |
| /admin/home-bottom-banners | **REMOVE → redirect** | Merge into /admin/banners |
| /admin/offers | REMOVE | Orphan |
| /admin/status | REMOVE | Orphan |
| /admin/tools | REMOVE | Orphan |
| /admin/theme | REMOVE | Orphan |
| /admin/advanced-settings | REMOVE | Orphan |
| /admin/combo-offers | REMOVE | Orphan |
| /admin/attributes | KEEP (for now) | Product variants may use |
| /admin/product-tags | KEEP (for now) | Product flow |
| /admin/inventory | REMOVE | No full module |
| /admin/inventory-logs | KEEP | Logs exist |
| /admin/invoices | REMOVE | Unless active |
| /admin/emails | REMOVE | Orphan |
| /admin/tracking | REMOVE | Orphan |
| /admin/reminders | REMOVE | Per spec |
| /admin/event-debug | REMOVE | Dev-only |

---

## 3. API Keep/Remove Matrix

| API | Decision | Reason |
|-----|----------|--------|
| /api/admin/categories | KEEP | Core |
| /api/admin/products | KEEP | Core |
| /api/admin/orders | KEEP | Core |
| /api/admin/brands | KEEP | Core |
| /api/admin/settings | KEEP | Core |
| /api/admin/dashboard | KEEP | Core |
| /api/admin/menu | KEEP | Sidebar |
| /api/admin/audit-logs | KEEP | Audit |
| /api/admin/home-banner-slides | REMOVE (P1) | Replace with /api/admin/banners |
| /api/admin/home-banners | REMOVE (P1) | Replace with /api/admin/banners |
| /api/admin/home-side-banners | REMOVE (P1) | Replace with /api/admin/banners |
| /api/admin/home-bottom-banners | REMOVE (P1) | Replace with /api/admin/banners |
| /api/settings | KEEP | Public settings |
| /api/settings/sales-top-bar | MERGE (P1) | Into /api/settings |
| /api/categories | KEEP | Public categories |
| /api/products/by-subcategory | REPLACE (P1) | Use category tree |

---

## 4. DB Model Keep/Deprecate Matrix

| Model | Decision | Reason |
|-------|----------|--------|
| TenantSettings | KEEP | Canonical settings |
| Category | KEEP | Core, parentId exists |
| Product, ProductImage, ProductVariant | KEEP | Core |
| Brand | KEEP | Core |
| Order, OrderItem, OrderNote | KEEP | Core |
| HomeBannerSlide | DEPRECATE (P1) | Merge into Banner |
| HomeBanner | DEPRECATE (P1) | Merge into Banner |
| HomeSideBanner | DEPRECATE (P1) | Merge into Banner |
| HomeBottomBanner | DEPRECATE (P1) | Merge into Banner |
| HomepageSection | DEPRECATE if unused | Check usage |
| Reminder, ReminderLog, ConversionTracking | DEPRECATE | Per spec |

---

## 5. Migration Strategy

- **P0:** Scope freeze, sidebar update, banner route redirects, no DB changes.
- **P1:** Create Banner model, migrate data, unified banner API, category frontend fix, settings merge.
- **P2:** Remove deprecated models, APIs, pages; cleanup.

---

## 6. Files to Change (P0)

| File | Change |
|------|--------|
| lib/admin-config.ts | Merge 4 banner items → 1 Banners; remove offers, status, tools, theme, advanced-settings, combo-offers, reminders, event-debug |
| app/api/admin/menu/route.ts | Same getStaticMenu updates |
| app/admin/banners/page.tsx | CREATE — placeholder for P1 |
| app/admin/home-banner-slides/page.tsx | Replace with redirect |
| app/admin/home-banners/page.tsx | Replace with redirect |
| app/admin/home-side-banners/page.tsx | Replace with redirect |
| app/admin/home-bottom-banners/page.tsx | Replace with redirect |

---

## 7. P0 Implementation — COMPLETED

### Changes made

| File | Change |
|------|--------|
| `lib/admin-config.ts` | Merged 4 banner items → 1 "Banners" (/admin/banners). Removed Flash Sale, Menus, About, Event Debug. Removed Reminders, Landing Pages, Message Inbox, Ad Management, Global AI from Settings. Added Brands, System Health. Added Audit Logs, Roles & Permissions to Settings. |
| `app/api/admin/menu/route.ts` | Updated getStaticMenu to match admin-config. |
| `app/admin/banners/page.tsx` | **Created** — placeholder with link to Store Settings (hero slider). |
| `app/admin/home-banner-slides/page.tsx` | Replaced with `redirect("/admin/banners")`. |
| `app/admin/home-banners/page.tsx` | Replaced with `redirect("/admin/banners")`. |
| `app/admin/home-side-banners/page.tsx` | Replaced with `redirect("/admin/banners")`. |
| `app/admin/home-bottom-banners/page.tsx` | Replaced with `redirect("/admin/banners")`. |
| `app/admin/AdminLayout.tsx` | Updated iconMap (Store, HeartPulse); removed unused imports. |

### Verification

- `/admin/home-banner-slides` → redirects to `/admin/banners`
- `/admin/home-banners` → redirects to `/admin/banners`
- `/admin/home-side-banners` → redirects to `/admin/banners`
- `/admin/home-bottom-banners` → redirects to `/admin/banners`
- Sidebar shows single "Banners" entry
- No membership references (none existed)

### Rollback

Revert the 8 file changes. Old banner pages can be restored from git history.

---

**P0 complete. Await approval before P1.**
