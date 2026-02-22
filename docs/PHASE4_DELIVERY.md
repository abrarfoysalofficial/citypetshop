# Phase 4 — Pages/CMS

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Site Pages
- **GET/POST /api/admin/cms-pages** — list, create
- **GET/PATCH/DELETE /api/admin/cms-pages/[id]** — get, update, delete
- **/admin/pages** — list CMS pages
- **/admin/pages/new** — create page
- **/admin/pages/[id]/edit** — edit page

### Blog Categories
- **BlogCategory** model — slug, nameEn, nameBn, sortOrder, isActive
- **CmsPage** — added blogCategoryId
- **GET/POST /api/admin/blog-categories** — list, create
- **PATCH/DELETE /api/admin/blog-categories/[id]** — update, delete
- **/admin/blog-categories** — CRUD UI

---

## 2. DB Migrations

```bash
npx prisma migrate deploy
```

- `20260222140000_add_blog_category` — blog_categories table, cms_pages.blog_category_id

---

## 3. UI Routes

| Path | Purpose |
|------|---------|
| /admin/pages | Site Pages list |
| /admin/pages/new | New page |
| /admin/pages/[id]/edit | Edit page |
| /admin/blog-categories | Blog Categories |
