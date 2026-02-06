# Supabase migrations

Migrations live in **supabase/migrations/** and should be applied in order (by filename). Use **Supabase Dashboard → SQL Editor** or `supabase db push` after `supabase link`.

---

## Order and purpose

| File | Purpose |
|------|--------|
| **001_initial_schema.sql** | Core tables: `site_settings`, `users`, `orders`, `order_items`, `products`, `categories`, `vouchers`, etc. |
| **002_order_status_voucher_redemptions_delivery.sql** | Order status, voucher redemptions, delivery fields. |
| **003_homepage_blocks.sql** | Homepage blocks / content structure. |
| **004_auth_providers.sql** | Auth provider config (Google, Facebook, Phone). |
| **005_order_notes_status_events_reviews.sql** | Order notes, status events, reviews. |
| **006_policy_urls_otp_tracking.sql** | Terms/Privacy URLs; **require_otp_phone_tracking** toggle for phone-based order tracking. |
| **007_courier_bookings_dashboard_layout.sql** | `courier_bookings` (Pathao/Steadfast/RedX), **dashboard_layout** (admin widget order/visibility), courier settings on `site_settings`. |
| **008_track_otp_verification.sql** | OTP verification for track-by-phone flow. |

---

## Local / demo mode

- The app runs **without** Supabase when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset: stub client returns empty/safe data; local products/blog/categories can still come from Sanity or local seed.
- For **production** with Supabase: run all migrations above so Orders, Users, Admin, Tracking, Realtime notes, and dashboard layout persist correctly.
