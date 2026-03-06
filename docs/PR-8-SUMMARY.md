# PR-8: Performance & Caching Hardening — Summary

**Status:** Complete  
**Date:** 2026-02-26

---

## Summary

PR-8 implements performance and caching hardening for live production: ISR on storefront pages, stock validation in checkout, revalidation hooks, safe API cache-control, and query limits.

---

## File List

| File | Change |
|------|--------|
| `app/api/checkout/order/route.ts` | Stock validation (transaction-safe), 409 on insufficient stock |
| `app/page.tsx` | Remove force-dynamic, revalidate 120s |
| `app/shop/page.tsx` | Remove force-dynamic, revalidate 300s, getProducts(48) |
| `app/product/[id]/page.tsx` | Remove force-dynamic, revalidate 120s |
| `app/category/[...slug]/page.tsx` | Remove force-dynamic, revalidate 300s, getProducts by category |
| `app/blog/page.tsx` | Remove force-dynamic, revalidate 300s |
| `app/blog/[slug]/page.tsx` | Remove force-dynamic, revalidate 300s |
| `app/combo-offers/page.tsx` | Remove force-dynamic, revalidate 300s |
| `app/landing/[slug]/page.tsx` | Remove force-dynamic, revalidate 300s |
| `app/api/admin/products/route.ts` | revalidatePath on create/update/delete |
| `app/api/admin/products/stock/route.ts` | revalidatePath on stock updates |
| `app/api/admin/products/import/route.ts` | revalidatePath after bulk import |
| `app/api/admin/settings/route.ts` | revalidatePath on settings update |
| `app/api/settings/route.ts` | Cache-Control on DEFAULTS response |
| `next.config.js` | Whitelist /api/settings for cache |
| `lib/data/db-products.ts` | getProducts(options), getProductsByIds |
| `src/data/provider.ts` | getProducts(options), getProductsByIds |
| `src/data/provider-db.ts` | Export getProductsByIds |
| `app/api/products/by-ids/route.ts` | Use getProductsByIds |
| `app/api/products/by-subcategory/route.ts` | Use getProducts({ categorySlug, limit }) |
| `tests/unit/checkout-stock.test.ts` | New — stock validation tests |
| `tests/unit/checkout-notification.test.ts` | Updated for $transaction mock |
| `tests/unit/cache-headers.test.ts` | New — cache header verification |

---

## Verification Checklist

- [x] Typecheck passes
- [x] Lint passes
- [x] Stock validation: 409 on insufficient stock, transaction-safe
- [x] Storefront pages: revalidate, no force-dynamic
- [x] revalidatePath on product/stock/settings mutations
- [x] /api/settings: Cache-Control
- [x] next.config: whitelist /api/settings, /api/feeds/*
- [x] getProducts limit 48, getProductsByIds for by-ids

**Tests:** Run `npm test -- --runInBand` if OOM; or `npx jest tests/unit/checkout-stock.test.ts tests/unit/checkout-notification.test.ts tests/unit/cache-headers.test.ts --runInBand`

---

## Performance Impact

| Change | Impact |
|-------|--------|
| ISR 2–5 min on storefront | Fewer DB hits, faster TTFB for cached pages |
| Stock validation in checkout | Prevents oversell; small latency from transaction |
| revalidatePath on mutations | Cache invalidation on change; no stale data |
| getProducts limit 48 | Bounded query size; shop/category load faster |
| /api/settings cache 60s | Fewer settings DB reads |

---

## Next Phase

**PR-9 — Security Tightening** is ready when you are.
