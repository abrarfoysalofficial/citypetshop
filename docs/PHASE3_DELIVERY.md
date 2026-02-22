# Phase 3 — Product Management

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Product Catalogs (Collections)
- **/admin/collections** — CRUD for product collections (uses existing /api/admin/collections)

### Product Filters
- **ProductFilter** model — key, labelEn, type (select|range|checkbox), config, sortOrder, isActive
- **GET/POST /api/admin/product-filters** — list, create
- **PATCH/DELETE /api/admin/product-filters/[id]** — update, delete
- **/admin/product-filters** — CRUD UI
- Seed: default filters (brand, price_range, category)

### Units
- **GET/POST /api/admin/units** — list/create sizes, weights, rams (Prisma)
- **PATCH/DELETE /api/admin/units/[id]** — update/delete
- **/admin/products/units** — unified Units management page

### Shipping
- **/admin/shipping** — edit deliveryInsideDhaka, deliveryOutsideDhaka, freeDeliveryThreshold from SiteSettings

---

## 2. DB Migrations

```bash
npx prisma migrate deploy
```

- `20260222130000_add_product_filter` — creates product_filters table

---

## 3. API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | /api/admin/units | List/create units |
| PATCH/DELETE | /api/admin/units/[id] | Update/delete unit |
| GET/POST | /api/admin/product-filters | List/create filters |
| PATCH/DELETE | /api/admin/product-filters/[id] | Update/delete filter |

---

## 4. UI Routes

| Path | Purpose |
|------|---------|
| /admin/collections | Product Catalogs |
| /admin/product-filters | Product Filters |
| /admin/products/units | Units (sizes, weights, rams) |
| /admin/shipping | Shipping settings |

---

## 5. Verification

1. Run migration, seed
2. Visit /admin/collections — create a collection
3. Visit /admin/product-filters — see default filters
4. Visit /admin/products/units — manage sizes/weights/rams
5. Visit /admin/shipping — edit delivery charges
