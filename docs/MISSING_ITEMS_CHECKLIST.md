# Missing / Partial Items – Evidence & Status

## Checklist table (before coding)


| Item                                                      | Status     | Evidence (file paths)                                                                                                                                                                | Implementation approach                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(1) Courier: Admin bulk 1-click booking**               | ⚠️ Partial | `app/admin/orders/AdminOrdersClient.tsx` (multi-select, provider dropdown, bulk Book); `app/api/admin/courier-booking/route.ts` (single-order, mock tracking, updates `orders` only) | Add `courier_bookings` table; store provider, consignment_id, tracking_code, label_url, request/response log; Admin settings for provider enable/disable, default provider, sandbox; progress + per-order success/fail; retries & partial success |
| **(2) Track order by Order ID or phone**                  | ⚠️ Partial | `app/api/track-order/route.ts` (GET `?q=`, BD phone validation, `require_otp_phone_tracking`); `app/track-order/page.tsx` (search by q, no OTP flow)                                 | API accept `orderId`/`phone` (keep `q`); track page: when `requiresOtp` show OTP step, mask name/address until verified; Admin toggle already in `site_settings.require_otp_phone_tracking`                                                       |
| **(3) Realtime tracking timeline**                        | ⚠️ Partial | `app/track-order/page.tsx` (polling 10s); `app/admin/orders/[id]/OrderNotesBlock.tsx` (fetch notes, no realtime); `order_notes`, `order_status_events` in 005                        | Add Supabase Realtime on `order_notes` + `order_status_events`; polling fallback; timeline UI with author type (Admin/Courier/System), visibility (public/internal)                                                                               |
| **(4) Checkout no hardcode + UI order**                   | ⚠️ Partial | `app/checkout/page.tsx` (coupon before payment ✓, 2-col layout ✓); `lib/checkout.ts` (DELIVERY_* constants); dropdown labels use constants                                           | Use delivery from `/api/checkout/settings` for dropdown labels; no hardcoded delivery in labels                                                                                                                                                   |
| **(5) Product page: no secure payment under Add to Cart** | ✅          | `app/product/[id]/ProductDetailContent.tsx` – no import of `SecurePaymentBadges`; `components/trust/SecurePaymentBadges.tsx` exists but not used on product page                     | Verify only; no change if not used on product page                                                                                                                                                                                                |
| **(6) Homepage mega menu mobile**                         | ✅          | `components/home/CategoryMegaMenu.tsx` – mobile: tap-to-expand (`mobileOpen`), accordion; desktop: hover; `lg:hidden` / `hidden lg:block`                                            | Verify no layout shift; add `min-height` or reserve space if needed                                                                                                                                                                               |
| **(7) Admin dashboard drag-and-drop**                     | ❌          | `app/admin/AdminDashboardClient.tsx` – fixed grid, no drag; `app/admin/page.tsx` uses it                                                                                             | Add drag-and-drop (e.g. react-grid-layout or dnd-kit); persist layout in `dashboard_layout` (Supabase) / localStorage fallback; hide/show per widget                                                                                              |
| **(8) Analytics Meta Events Manager style**               | ⚠️ Partial | `app/admin/analytics/page.tsx` (event list, counts, debug); `app/api/admin/analytics/events/route.ts`; `analytics_events` in 005                                                     | Add: event list (ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase); counts by date range, last received, source, dedup; diagnostics (missing pixel/CAPI); export CSV; IDs from Admin + env                              |
| **(9) Auth: no demo credentials in prod**                 | ⚠️ Partial | `app/admin/login/page.tsx`, `app/login/LoginForm.tsx` – demo text when `AUTH_MODE === "demo" && NODE_ENV !== "production"`                                                           | Production already hides (NODE_ENV=production). Require: demo credentials text only when Admin setting or `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` enabled; default OFF                                                                                |


## DB migrations required

- **courier_bookings** (or extend orders): store per-booking log: provider, consignment_id, tracking_code, label_url/waybill_url, request/response log, created_at, updated_at.
- **site_settings** or **courier_configs**: provider enable/disable, default_provider, sandbox/prod (already have courier_configs in 001).
- **dashboard_layout**: per user/role, widget ids and order, visibility (JSON).
- **order_notes** (existing), **order_status_events** (existing) – used for timeline.
- **analytics_events** (existing) – used for Meta-style list; ensure indexes.

## Implementation order (done)

1. DB migrations: `007_courier_bookings_dashboard_layout.sql`, `008_track_otp_verification.sql`.
2. (1) Courier bulk: `courier_bookings` table, `/api/admin/courier-booking`, `/api/admin/courier-settings`, Admin Orders (progress, Auto provider), Admin Courier page (enable/disable, default, sandbox).
3. (2) Track by phone + OTP: `/api/track-order` (q/orderId/phone, masked response when OTP required), `/api/track-order/send-otp`, `/api/track-order/verify-otp`, track-order page OTP step.
4. (3) Realtime timeline: track-order page Supabase Realtime + 10s polling, timeline with [Admin]/[Courier]/[System] and visibility.
5. (4) Checkout: delivery labels from `/api/checkout/settings` (no DELIVERY_* constants in labels).
6. (5)(6) Verified: product page has no SecurePaymentBadges; mega menu has mobile accordion.
7. (8) Analytics: Meta-style event list, counts by date range, last received, diagnostics, Export CSV.
8. (7) Admin dashboard: drag-and-drop widgets, hide/show, persist via `/api/admin/dashboard-layout` + localStorage fallback.
9. (9) Auth: demo credentials only when `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true`.
10. QA script + deployment checklist in `docs/`.

