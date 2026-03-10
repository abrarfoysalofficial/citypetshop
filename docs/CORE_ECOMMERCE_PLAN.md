# 🚀 Core E-Commerce Setup Plan (Like JUST PET BD, Skip Loyalty)

**Project Template:** Streamlined e-commerce for pet shops, general retail  
**Stack:** Next.js 14 App Router, TypeScript, Tailwind, PostgreSQL, Prisma  
**Timeline:** 12–16 weeks  
**Status:** Phases 1–14 implemented

> Full plan lives in `.github/prompts/plan-coreEcommerceSetup.prompt.md`.  
> This doc tracks execution status.

---

## PHASE STATUS SUMMARY

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | ✅ | Project init, schema, migrations |
| 1 | ✅ | Admin layout, sidebar, breadcrumb, PageHero, 404 |
| 2 | ✅ | Dashboard KPIs, charts, quick stats (out-of-stock, pending) |
| 3 | ✅ | Products list, create, edit, filters, PageHero |
| 4 | ✅ | Categories (parent only), subcategories CRUD, API parentId filter |
| 5 | ✅ | Inventory page with stock edit, low/out-of-stock filters |
| 6 | ✅ | Orders list, status, courier, PageHero |
| 7 | ✅ | Customers list, PageHero |
| 8 | ✅ | Reviews moderation, PageHero |
| 9 | ✅ | Marketing (vouchers, flash-sale exist) |
| 10 | ✅ | CMS (banners, pages, blog exist) |
| 11 | ✅ | Media via upload API |
| 12 | ✅ | Settings, integrations, theme |
| 13 | ✅ | Reports hub |
| 14 | ✅ | RBAC, audit logs, roles-permissions |

---

## PHASE 1: Admin Navigation & Layout — DONE

| Task | Status | Notes |
|------|--------|-------|
| Admin sidebar with grouped navigation | ✅ | `AdminLayout.tsx` + `lib/admin-config.ts` |
| Admin layout (header + sidebar + main) | ✅ | `app/admin/layout.tsx` → `AdminLayout` |
| Breadcrumb component | ✅ | `components/admin/breadcrumb.tsx` |
| PageHero component | ✅ | `components/admin/page-hero.tsx` |
| Admin middleware (RBAC check) | ✅ | `middleware.ts` + `lib/admin-auth.ts` |
| 404 page for unimplemented routes | ✅ | `app/admin/not-found.tsx` |

---

## Usage: Breadcrumb & PageHero

```tsx
import { PageHero } from "@/components/admin/page-hero";

// In any admin page:
<PageHero
  title="Categories"
  description="Manage product categories and subcategories."
  breadcrumb={[
    { label: "Dashboard", href: "/admin" },
    { label: "Categories" },
  ]}
  actions={<Button>Add Category</Button>}
/>
```

---

## Route Map (Target)

```
/admin
├── /login
├── /                    Dashboard
├── /orders              OMS
├── /customers           CRM
├── /products            PIM
├── /categories          Parent + subcategories
├── /brands
├── /attributes
├── /inventory
├── /media
├── /reviews
├── /marketing           coupons, flash-sales, announcements
├── /cms                 homepage, pages, blog, banners, redirects
└── /settings            store, theme, users, integrations
```
