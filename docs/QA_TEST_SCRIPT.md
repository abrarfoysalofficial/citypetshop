# QA Test Script (~30 min) – City Plus Pet Shop

Use this to verify routes, checkout, courier booking, track-by-phone + OTP, realtime timeline, admin dashboard drag-and-drop, and analytics.

---

## 1. Routes click-through (5 min)

- Homepage loads; mega menu opens (desktop hover, mobile tap).
- Navigate: Shop → Category → Product → Add to Cart.
- Cart slide-over opens; go to Checkout.
- From homepage: Track Order, Login, Register, Contact, Blog, Offers.
- Admin: `/admin/login` → (demo or Supabase) → Dashboard, Orders, Products, Analytics, Courier, Settings.

---

## 2. Checkout flow (5 min)

- Cart has items → Checkout page shows 2-column layout (left: form, right: summary).
- **Coupon box is before** Payment method; enter voucher → Apply → discount and total update.
- Delivery charge: change District → label and total use Admin-configured amounts (no hardcoded 70/130 in labels).
- Fill shipping details, accept terms, Place Order → success / order-complete.
- Empty cart → Checkout shows “Your cart is empty” with link to shop.

---

## 3. Bulk courier booking (5 min)

- Admin → Orders; ensure list has orders (or use seed).
- Select multiple orders (checkboxes); “Select all” works.
- Dropdown: provider (Pathao / Steadfast / RedX) and “Auto (default)”.
- Click “Book Courier” → progress shows (e.g. 1/3, 2/3); per-order success/fail messages.
- Partial failure: one order fails → others still show result; batch not blocked.
- Admin → Courier: enable/disable providers, default provider, Sandbox toggle; Save.
- Local/demo: mock booking returns fake tracking code; same UI/DB shape.

---

## 4. Track by phone + OTP gating (5 min)

- `/track-order`: search by **Order ID** → order list and timeline (if any).
- Search by **phone** (e.g. 01XXXXXXXXX or +8801XXXXXXXXX) → if OTP required (Admin Settings): masked list + “Verify your phone”.
- Send OTP → Enter 6-digit code → Verify → full order details and timeline visible.
- Timeline shows [System], [Admin], [Courier] and “(visible to customer)” where applicable.
- Admin → Settings: toggle “OTP required for phone tracking” and persist (Supabase or local fallback).

---

## 5. Realtime timeline update (3 min)

- Track-order page open with an order; Admin → Order detail → add a **public** note.
- Within polling interval (~10 s) or Realtime (if Supabase): new note appears on track-order timeline without refresh.
- Timeline: timestamps, author type (Admin/Courier/System), visibility indicated.

---

## 6. Admin drag-and-drop dashboard (4 min)

- Admin → Dashboard: widgets (KPI cards, Sales chart, Visitors chart, Activity) have drag handle.
- Drag a widget to reorder → layout updates; refresh page → order persisted (API or localStorage).
- Click eye to hide a widget → it moves to “Hidden widgets”; click to show again.
- No existing KPI/chart removed; only reorder and hide/show.

---

## 7. Analytics events (3 min)

- Admin → Analytics: event list includes ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase.
- Date range filter; counts by date range; “Last received” time per event type.
- Table: Event, Source, Page, Time, Dedup, Match quality, Payload debug.
- Diagnostics: missing Pixel/CAPI config warnings when not set.
- Export CSV → file downloads with event data.

---

## 8. Auth & demo credentials

- Production or when `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` is not `true`: no demo credentials text on login or admin login.
- When `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true`: demo hint visible (for dev only).

---

## 9. Product page & mega menu

- Product detail: no “secure payment” badges under Add to Cart (trust badges only checkout/footer if at all).
- Homepage mega menu: mobile = tap-to-expand accordion; desktop = hover; no layout shift.

---

## Sign-off

- Tester: ________________  
- Date: ________________  
- Build/commit: ________________  
- Notes: ________________

