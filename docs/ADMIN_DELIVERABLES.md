# Admin Panel – Implementation Deliverables

## 1. Step-by-Step Implementation Plan

See `docs/ADMIN_IMPLEMENTATION_PLAN.md`.

**Checkpoints:**
- [x] Step 1: Expand sidebar config with all A–Z routes
- [x] Step 2: Admin Settings API – Supabase direct
- [x] Step 3: Upload API – store-assets bucket
- [x] Step 4: Route alias products/new → products/upload
- [x] Step 5: Payment gateways, dashboard-layout, analytics – Supabase direct
- [x] Step 6: TypeScript check passes

---

## 2. Files Changed/Added

### Created
| File | Description |
|------|-------------|
| `docs/ADMIN_IMPLEMENTATION_PLAN.md` | Implementation plan |
| `docs/ADMIN_DELIVERABLES.md` | This file |
| `supabase/migrations/013_store_assets_bucket.sql` | Storage policies for store-assets bucket |

### Modified
| File | Changes |
|------|---------|
| `lib/admin-config.ts` | Added "Settings & More" collapsible section with Store Settings, Checkout Settings, Payments, Analytics, Blog, Customers, Vouchers, Courier, Team, Studio |
| `app/api/admin/settings/route.ts` | Supabase direct; removed provider/demo branch; added `dynamic = "force-dynamic"` |
| `app/api/admin/payment-gateways/route.ts` | Supabase direct; removed isDemoAuth; fallback to DEMO_PAYMENT_GATEWAYS when empty |
| `app/api/admin/dashboard-layout/route.ts` | Added requireAdminAuth; removed demo branch |
| `app/api/admin/analytics/events/route.ts` | Import from `supabase/adminData` instead of provider |
| `app/api/admin/upload/route.ts` | Added `store-assets` to allowed buckets |
| `next.config.js` | Redirect `/admin/products/new` → `/admin/products/upload` |
| `app/admin/AdminLayout.tsx` | Expanded "Settings & More" by default |

---

## 3. SQL Migration Scripts

### Existing (unchanged)
- `011_admin_live_schema.sql` – categories, product_rams/weights/sizes, banners, RLS
- `012_storage_buckets.sql` – product-images, banner-images policies

### New
- `013_store_assets_bucket.sql` – store-assets bucket policies (create bucket manually in Dashboard first)

---

## 4. Storage Setup Steps

1. **Supabase Dashboard → Storage → New bucket**
2. Create buckets:
   - `product-images` – public, 5MB, image/*
   - `banner-images` – public, 5MB, image/*
   - `store-assets` – public, 5MB, image/* (for logos)
3. Run migrations `012_storage_buckets.sql` and `013_store_assets_bucket.sql` for RLS policies

---

## 5. Verification Checklist

### Routes to Test (Admin)
- [ ] `/admin/login` – Supabase sign-in
- [ ] `/admin` – Dashboard (stats from Supabase)
- [ ] `/admin/settings` – Store settings (site_settings)
- [ ] `/admin/checkout-settings` – Checkout settings (same API)
- [ ] `/admin/products` – Product list
- [ ] `/admin/products/upload` – Product upload
- [ ] `/admin/products/new` – Redirects to upload
- [ ] `/admin/orders` – Orders list
- [ ] `/admin/home-banner-slides`, `/admin/home-banners`, etc.
- [ ] Sidebar "Settings & More" – all child links

### Routes to Test (Storefront – unchanged)
- [ ] `/`, `/shop`, `/product/[id]`, `/category/[slug]`
- [ ] `/cart`, `/checkout`, `/order-complete`
- [ ] `/blog`, `/account/*`, auth routes

### Seed Minimal Data
1. **team_members**: Insert row with `email`, `role='admin'` or `is_admin=true`
2. **site_settings**: Default row exists from `001_initial_schema.sql`
3. **Supabase Auth**: Create user with same email as team_members

### Confirm Admin Auth + RLS
1. Sign in at `/admin/login` with Supabase credentials
2. Verify `team_members` has matching email (case-insensitive) and `role='admin'` or `is_admin=true`
3. Non-admin → sign out and "Access denied"

---

## 6. Build & Deploy

```bash
npm run build
# If OOM: increase NODE_OPTIONS or run on machine with more RAM
```

Vercel deployment: Ensure env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

---

## Preserved (Zero Loss)

- `NEXT_PUBLIC_DATA_SOURCE`: local | supabase | sanity
- `NEXT_PUBLIC_AUTH_MODE`: demo | supabase
- All storefront routes and behavior
- Sanity Studio `/studio`, ISR, `/api/revalidate`
- Provider (`src/data/provider.ts`), contexts, types
- All existing admin page files (no deletions)
- Legacy admin routes accessible via "Settings & More" sidebar
