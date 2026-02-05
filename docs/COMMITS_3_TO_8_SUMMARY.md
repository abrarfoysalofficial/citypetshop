# Commits 3–8: Implementation Summary

## Commit 3: DB Migrations

**Files:**
- `supabase/migrations/005_order_notes_status_events_reviews.sql`

**Changes:**
- `order_notes` table: id, order_id, type (admin/courier/system), visibility (public/internal), message, created_by, created_at
- `order_status_events` table: id, order_id, provider, status, payload_summary
- `product_reviews` table: id, product_id, order_id, user_id, rating, comment, status (pending/approved/rejected), UNIQUE(order_id, product_id)
- `analytics_events` table: event_name, event_id, source, page_url, referrer, payload_summary, match-quality fields
- `site_settings.review_eligible_days` column (default 90)
- Index on `orders.guest_phone` for tracking lookup

---

## Commit 4: Tracking Page (Order ID + Phone + Realtime)

**Files:**
- `app/api/track-order/route.ts` – lookup by orderId or phone (BD validation)
- `app/track-order/page.tsx` – single input, order list, timeline (notes + events)

**Behavior:**
- Search by Order ID or Bangladesh phone
- Phone search returns matching orders; dropdown when multiple
- Timeline shows courier status + public notes
- Polling every 10s when Supabase source

---

## Commit 5: Admin Bulk Courier Booking

**Files:**
- `app/admin/orders/AdminOrdersClient.tsx` – checkboxes, select all, bulk actions bar
- `app/api/admin/courier-booking/route.ts` – POST orderId + provider (pathao/steadfast/redx)
- `app/admin/orders/page.tsx` – uses AdminOrdersClient

**Behavior:**
- Multi-select orders, provider dropdown, Bulk Book Courier button
- Local: returns mock tracking code
- Supabase: updates orders + inserts order_status_events

---

## Commit 6: Reviews Supabase + Moderation

**Files:**
- `app/api/reviews/route.ts` – POST/GET support Supabase product_reviews
- `app/api/reviews/orders/route.ts` – delivered orders from Supabase, review_eligible_days
- `app/api/admin/reviews/route.ts` – PATCH approve/reject
- `app/admin/reviews/page.tsx` + `AdminReviewsClient.tsx`
- `app/admin/layout.tsx` – Review Moderation nav link

**Behavior:**
- Reviews stored in product_reviews when DATA_SOURCE=supabase
- Moderation queue in Admin → Review Moderation
- Server-side validation (delivered order, order+product unique)

---

## Commit 7: Analytics Events + Admin View

**Files:**
- `app/api/analytics/events/route.ts` – POST capture event (dedup by event_id)
- `app/api/admin/analytics/events/route.ts` – GET with filters
- `lib/analytics.ts` – captureEvent() helper
- `app/admin/analytics/page.tsx` – Events table, counts, filters
- `app/product/[id]/ProductDetailContent.tsx` – ViewContent
- `context/CartContext.tsx` – AddToCart
- `app/checkout/page.tsx` – InitiateCheckout, Purchase

**Behavior:**
- captureEvent() sends to /api/analytics/events
- Admin Analytics: event counts (7d), table with filters

---

## Commit 8: Remove Hardcoded Values

**Files:**
- `app/api/checkout/settings/route.ts` – delivery charges from site_settings
- `app/api/checkout/voucher/route.ts` – voucher validation (local vouchers or Supabase)
- `lib/checkout.ts` – calculateCheckout accepts delivery overrides
- `app/checkout/page.tsx` – fetches settings, uses voucher API

**Behavior:**
- Delivery from site_settings (delivery_inside_dhaka, delivery_outside_dhaka)
- Voucher validation via API (local demo vouchers or Supabase vouchers table)
