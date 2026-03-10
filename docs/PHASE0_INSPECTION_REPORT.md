# Phase 0 — Inspection Report (Current State)

**Date:** March 6, 2025  
**Scope:** Settings, Categories, Banners, Admin Sidebar  
**No code changes — inspection only.**

---

## 1. EXACT SETTINGS FLOW MAP

### Admin Settings
| Layer | File | Purpose |
|-------|------|---------|
| Admin page | `app/admin/settings/page.tsx` | Store Settings form (logo, site name, address, phone, announcement bar, colors) |
| Admin form | Same file | Fetches via `GET /api/admin/settings`, saves via `PATCH /api/admin/settings` |
| Admin API | `app/api/admin/settings/route.ts` | GET/PATCH → Prisma `TenantSettings` |

### Public Settings
| Layer | File | Purpose |
|-------|------|---------|
| Public API | `app/api/settings/route.ts` | GET → Prisma `TenantSettings` (no secrets) |
| Sales top bar API | `app/api/settings/sales-top-bar/route.ts` | GET → `salesTopBarText`, `salesTopBarEnabled` (duplicate source) |
| Context | `store/SiteSettingsContext.tsx` | Fetches `/api/settings`, provides `useSiteSettings()` |

### Frontend Consumers
| Component | File | Uses |
|-----------|------|------|
| Navbar | `components/Navbar.tsx` | `useSiteSettings()` → logo_url, site_name_en |
| HomeFooter | `components/home/HomeFooter.tsx` | `useSiteSettings()` → logo_dark_url, site_name_en, address_en, phone, email, tagline_en, social_links, footer_links |
| SlidingSalesBar | `components/home/SlidingSalesBar.tsx` | `useSiteSettings()` → sales_top_bar_text, sales_top_bar_enabled |

### Prisma Model
- **TenantSettings** — single table, tenant-scoped. Fields: logoUrl, logoDarkUrl, siteNameEn, addressEn, phone, email, salesTopBarText, salesTopBarEnabled, heroSlider, sideBanners, etc.

### Revalidation
- Admin PATCH calls: `revalidatePath("/")`, `revalidatePath("/api/settings")`, `revalidatePath("/api/settings/sales-top-bar")`

### Hardcoded / Fallbacks
- `DEFAULT_SETTINGS` in SiteSettingsContext (fallback when API fails)
- `DEFAULTS` in `/api/settings` (when no TenantSettings row)
- `EMPTY_SETTINGS` in admin API (when no row)
- SlidingSalesBar: `DEFAULT_TEXT` when `sales_top_bar_text` empty

### Root Cause (if broken)
- `/api/settings/sales-top-bar` is redundant — SlidingSalesBar uses `useSiteSettings()` which reads from `/api/settings`. The sales-top-bar route can be deprecated.
- No cache invalidation issue if revalidatePath is called (already in place).

---

## 2. EXACT CATEGORY FLOW MAP

### Admin Categories
| Layer | File | Purpose |
|-------|------|---------|
| Admin page | `app/admin/categories/page.tsx` | CRUD via inline modals, fetches `GET /api/admin/categories` |
| Admin API | `app/api/admin/categories/route.ts` | GET/POST/PATCH/DELETE → Prisma `Category` |
| Admin new (legacy) | `app/admin/categories/new/page.tsx` | Uses `useCategories().addCategory` — local state only, does NOT persist to API |
| Admin edit (legacy) | `app/admin/categories/[slug]/edit/page.tsx` | Uses `useCategories().updateCategory` — local state only, does NOT persist to API |

### Public Categories
| Layer | File | Purpose |
|-------|------|---------|
| Public API | `app/api/categories/route.ts` | GET → Prisma Category (id, slug, name, nameBn, parentId, parentSlug) |
| Context | `store/CategoriesContext.tsx` | Fetches `/api/categories`, builds flat list + tree, provides `useCategories()` |

### Frontend Consumers
| Component | File | Source |
|-----------|------|--------|
| Navbar | `components/Navbar.tsx` | `useCategories().navCategories` |
| CategoryMegaMenu | `components/home/CategoryMegaMenu.tsx` | `useCategories().categoriesTree` |
| PopularCategoryRow | `components/home/PopularCategoryRow.tsx` | `useCategories().categories` |
| SearchStrip | `components/home/SearchStrip.tsx` | Fetches `/api/categories` directly |
| CategoryMenu | `components/layout/CategoryMenu.tsx` | Fetches `/api/categories` directly |
| CategoryChipsRow | `components/home/CategoryChipsRow.tsx` | Fetches `/api/categories` directly |
| ShopClient | `app/shop/ShopClient.tsx` | Fetches `/api/categories` directly |

### Product Forms
| Page | File | Source |
|------|------|--------|
| Product upload | `app/admin/products/upload/page.tsx` | Fetches `/api/admin/categories`, maps nameEn → name |
| Admin products | `app/admin/products/page.tsx` | Fetches `/api/admin/categories`, maps nameEn → name |
| Bulk import | `app/admin/products/bulk/page.tsx` | Fetches `/api/admin/categories` |

### Server-Side Category Helpers
| File | Purpose |
|------|---------|
| `lib/categories-db.ts` | `getCategoryBySlugFromDb`, `getSubcategoryByFullSlugFromDb` |
| `app/category/[...slug]/page.tsx` | Uses categories-db for metadata and display |
| `app/api/products/by-subcategory/route.ts` | Uses `getSubcategoryByFullSlugFromDb` |
| `src/data/provider-db.ts` | `getCategoriesFromDb` for ProductsRepository |
| `src/services/products.ts` | `listCategories` → `getCategories()` |

### Prisma Model
- **Category** — id, slug, nameEn, nameBn, parentId, sortOrder, isActive, deletedAt

### Hardcoded / Legacy
- `lib/categories-master.ts` — MASTER_CATEGORIES still exists but no longer used by core flows (CategoryMegaMenu, PopularCategoryRow use API)
- `lib/data.ts` — categories array still exists but CategoriesContext fetches from API
- HomeFooter `POPULAR_CATEGORIES` — hardcoded footer links (different from product categories)

### Root Cause (if broken)
- Admin `/admin/categories/new` and `/admin/categories/[slug]/edit` do not persist to DB — they use CategoriesContext local state only.

---

## 3. EXACT BANNER FLOW MAP

### Banner Data Sources (Multiple)
| Source | Model/Table | Used By |
|--------|-------------|---------|
| TenantSettings.heroSlider | JSON in TenantSettings | getHomeData (fallback when HomeBannerSlide empty) |
| HomeBannerSlide | Prisma table | getHomeData (primary hero source) |
| HomeBanner | Prisma table | `/api/admin/home-banners` — NOT used by homepage |
| HomeSideBanner | Prisma table | `/api/admin/home-side-banners` — NOT used by homepage |
| HomeBottomBanner | Prisma table | `/api/admin/home-bottom-banners` — NOT used by homepage |

### Homepage Hero Flow
| Step | File | Logic |
|------|------|-------|
| 1 | `src/data/provider-db.ts` → getHomeData | Reads TenantSettings.heroSlider (JSON) → heroSlides |
| 2 | Same | Reads HomeBannerSlide table → fromSlides |
| 3 | Same | `allSlides = fromSlides.length > 0 ? fromSlides : heroSlides` |
| 4 | `app/page.tsx` | Passes homeData.heroSlides to HeroSlider |
| 5 | `components/home/HeroSlider.tsx` | Renders slides |

### Admin Banner Pages
| Route | File | Behavior |
|-------|------|----------|
| `/admin/banners` | `app/admin/banners/page.tsx` | Placeholder — links to Store Settings, no CRUD |
| `/admin/home-banner-slides` | `app/admin/home-banner-slides/page.tsx` | Redirects to `/admin/banners` |
| `/admin/home-banners` | `app/admin/home-banners/page.tsx` | Redirects to `/admin/banners` |
| `/admin/home-side-banners` | `app/admin/home-side-banners/page.tsx` | Redirects to `/admin/banners` |
| `/admin/home-bottom-banners` | `app/admin/home-bottom-banners/page.tsx` | Redirects to `/admin/banners` |

### Banner APIs
| API | File | Model | Used by Homepage? |
|-----|------|-------|-------------------|
| `/api/admin/home-banner-slides` | `app/api/admin/home-banner-slides/route.ts` | HomeBannerSlide | Yes (via getHomeData) |
| `/api/admin/home-banners` | `app/api/admin/home-banners/route.ts` | HomeBanner | No |
| `/api/admin/home-side-banners` | `app/api/admin/home-side-banners/route.ts` | HomeSideBanner | No |
| `/api/admin/home-bottom-banners` | `app/api/admin/home-bottom-banners/route.ts` | HomeBottomBanner | No |

### Side Banners
- getHomeData returns `sideBanners: []` always — TenantSettings.sideBanners and HomeSideBanner table are not wired to homepage.

### PromoBanners (Homepage)
- `components/home/PromoBanners.tsx` — uses hardcoded `BANNERS` array, not from DB.

### Root Cause
- Hero: Two sources (TenantSettings.heroSlider JSON + HomeBannerSlide table). Priority: HomeBannerSlide wins if non-empty.
- No admin UI to manage HomeBannerSlide — `/admin/banners` is a placeholder. Hero is edited via Store Settings (TenantSettings.heroSlider) or there is no UI for HomeBannerSlide.
- HomeBanner, HomeSideBanner, HomeBottomBanner have APIs and tables but homepage never reads them.
- PromoBanners: hardcoded.

---

## 4. EXACT ADMIN SIDEBAR CLEANUP MAP

### Sidebar Source
- Primary: `GET /api/admin/menu` → built from PermissionGroups + Permissions (DB)
- Fallback: `lib/admin-config.ts` → `adminSidebarConfig`
- AdminLayout: `app/admin/AdminLayout.tsx` uses menu API, falls back to adminSidebarConfig

### adminSidebarConfig (lib/admin-config.ts)
| Item | href | Status |
|------|------|--------|
| Dashboard | /admin | KEEP |
| Banners | /admin/banners | KEEP (single entry) |
| Category | /admin/categories | KEEP |
| Products | /admin/products (+ children) | KEEP |
| Orders | /admin/orders | KEEP |
| Brands | /admin/brands | KEEP |
| System Health | /admin/system-health | KEEP |
| Settings & More | /admin/settings (+ children) | KEEP |

### Duplicate Banner Routes (redirect to /admin/banners)
- `/admin/home-banner-slides` — redirect
- `/admin/home-banners` — redirect
- `/admin/home-side-banners` — redirect
- `/admin/home-bottom-banners` — redirect

These are NOT in the sidebar config. They exist as legacy routes that redirect.

### Membership
- No membership references in admin config or codebase.

### API Menu getStaticMenu() Fallback
- Same structure: Dashboard, Banners, Category, Products, Orders, Brands, System Health, Settings & More.
- No duplicate banner items.

---

## ROUTE KEEP/REMOVE LIST

### KEEP
| Route | Reason |
|-------|--------|
| /admin | Dashboard |
| /admin/banners | Single banner entry point |
| /admin/categories | Category CRUD |
| /admin/products, /admin/products/upload, etc. | Product management |
| /admin/orders | Orders |
| /admin/brands | Brands |
| /admin/system-health | System health |
| /admin/settings | Store settings |
| /api/settings | Public settings |
| /api/admin/settings | Admin settings |
| /api/categories | Public categories |
| /api/admin/categories | Admin categories |

### REMOVE or REDIRECT (already redirect)
| Route | Action |
|-------|--------|
| /admin/home-banner-slides | Already redirects → remove page file, keep redirect or 404 |
| /admin/home-banners | Already redirects |
| /admin/home-side-banners | Already redirects |
| /admin/home-bottom-banners | Already redirects |

### DEPRECATE (optional)
| Route | Reason |
|-------|--------|
| /api/settings/sales-top-bar | Redundant; SlidingSalesBar uses /api/settings |

---

## API KEEP/REMOVE LIST

### KEEP
| API | Reason |
|-----|--------|
| GET /api/settings | Public storefront settings |
| GET /api/admin/settings | Admin read |
| PATCH /api/admin/settings | Admin write |
| GET /api/categories | Public categories |
| GET/POST/PATCH/DELETE /api/admin/categories | Admin category CRUD |

### REMOVE or DEPRECATE
| API | Reason |
|-----|--------|
| GET /api/settings/sales-top-bar | Redundant |
| GET/POST/PATCH/DELETE /api/admin/home-banners | Homepage does not use HomeBanner |
| GET/POST/PATCH/DELETE /api/admin/home-side-banners | Homepage does not use; sideBanners always [] |
| GET/POST/PATCH/DELETE /api/admin/home-bottom-banners | Homepage does not use HomeBottomBanner |

### KEEP (for Phase 3 banner consolidation)
| API | Reason |
|-----|--------|
| GET/POST/PATCH/DELETE /api/admin/home-banner-slides | Used by getHomeData for hero |

---

## DB MODEL KEEP/DEPRECATE LIST

### KEEP
| Model | Reason |
|-------|--------|
| TenantSettings | Settings, heroSlider JSON, sideBanners JSON |
| Category | Product categories |
| HomeBannerSlide | Current hero slider source (used by getHomeData) |

### DEPRECATE (Phase 3)
| Model | Reason |
|-------|--------|
| HomeBanner | Not used by homepage |
| HomeSideBanner | Not used by homepage |
| HomeBottomBanner | Not used by homepage |

*Deprecate = stop using, do not delete tables yet to avoid migration complexity.*

---

## EXACT FILES TO EDIT IN PHASE 1 (Settings)

Phase 1 goal: Admin settings update must work fully; storefront must reflect latest data.

### Files to Edit

| File | Change |
|------|--------|
| `app/api/settings/route.ts` | Ensure sales_top_bar_text, sales_top_bar_enabled in response (already present) |
| `app/api/admin/settings/route.ts` | Ensure revalidatePath after PATCH (already present) |
| `store/SiteSettingsContext.tsx` | Ensure sales_top_bar in DEFAULT_SETTINGS (already present) |
| `components/home/SlidingSalesBar.tsx` | Use useSiteSettings() not /api/settings/sales-top-bar (already uses useSiteSettings) |
| `components/Navbar.tsx` | Use useSiteSettings() for logo, site name (already uses) |
| `components/home/HomeFooter.tsx` | Use useSiteSettings() for logo, address, phone, email (already uses) |

### Optional Cleanup (Phase 1 or later)
| File | Change |
|------|--------|
| `app/api/settings/sales-top-bar/route.ts` | Remove or mark deprecated if no other consumers |

### Verification
- Admin → Settings → change logo, site name, address, phone, announcement bar → Save
- Refresh storefront → Navbar, Footer, SlidingSalesBar show updated values

---

*End of Phase 0 Report*
