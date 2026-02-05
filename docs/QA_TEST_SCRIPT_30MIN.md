# 30-Minute QA Test Script – City Plus Pet Shop

## Prerequisites
- Site running (`npm run dev`)
- Demo mode: `NEXT_PUBLIC_AUTH_MODE=demo` (or leave unset in dev)
- Logged in as user: `user@cityplus.local` / `User@12345`
- Logged in as admin: `admin@cityplus.local` / `Admin@12345`

---

## 1. Storefront Route Click-Through (5 min)

| Step | Route | Action | Expected |
|------|-------|--------|----------|
| 1 | `/` | Load homepage | Hero, categories, product grids, brands, reviews |
| 2 | Mega menu | Hover category | Subcategory flyout appears |
| 3 | `/shop` | Load shop | Product grid, filters |
| 4 | `/category/dog-food` | Load category | Products for dog food |
| 5 | `/category/cat-food/adult-food` | Load subcategory | Products or category fallback |
| 6 | `/product/1` | Load product | Product detail, images, Add to Cart, Buy Now |
| 7 | `/blog` | Load blog | Blog list |
| 8 | `/combo-offers` | Load combos | Combo offers |
| 9 | `/contact` | Load contact | Contact form/info |
| 10 | `/terms`, `/privacy`, `/refund` | Load legal | Content loads |

---

## 2. Add to Cart + Buy Now (3 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Product page → Add to Cart | Cart slideover opens, item added |
| 2 | Change quantity, Add to Cart again | Quantity updates |
| 3 | Product with variations → select variation → Add to Cart | Correct variation/price in cart |
| 4 | Buy Now (single product) | Cart cleared, product added, redirect to `/checkout` |
| 5 | Buy Now disabled when out of stock | Button disabled |

---

## 3. Checkout Flow (5 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Cart has items → go to `/checkout` | Form + order summary visible |
| 2 | Coupon box | Enter SAVE50 → Apply → discount shown |
| 3 | Payment tabs | COD / Online selectable |
| 4 | Fill name, phone, address | Required fields validate |
| 5 | District dropdown | Options with delivery charge |
| 6 | Terms checkbox | Submit blocked until checked |
| 7 | Place Order | Success; redirect to order-complete |

---

## 4. Account Orders / Invoices (3 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/account` (logged in) | Dashboard with recent orders |
| 2 | `/account/orders` | Order list |
| 3 | Click order | Order detail with items |
| 4 | `/account/invoices` | Invoice list |
| 5 | `/account/returns` | Returns list |

---

## 5. Admin: Orders List, Bulk Booking, Order Detail, Notes (8 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/admin/login` | Login as admin |
| 2 | `/admin/orders` | Orders table |
| 3 | **Bulk select** | Checkboxes on orders; “Select all on page” |
| 4 | **Bulk Book Courier** | Bar appears; provider select; one-click book |
| 5 | Per-order result | Success/failed + retry |
| 6 | `/admin/orders/ORD-xxx` | Order detail |
| 7 | Add note (admin/courier) | Note saved; visible in timeline |
| 8 | Realtime | Notes update without refresh (when Realtime wired) |

---

## 6. Tracking by Order ID and Phone (4 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/track-order` | Input for Order ID or phone |
| 2 | Enter Order ID (e.g. ORD-1001) | Timeline with status events |
| 3 | Enter phone (e.g. +880 1700 000001) | List of matching orders; select one |
| 4 | Realtime notes | New admin/courier notes appear live |

---

## 7. Realtime Notes Update Verification (2 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open track-order in Tab A | Order timeline visible |
| 2 | Admin adds note in Tab B | Note appears in Tab A without refresh |

---

## 8. Analytics Events Verification (Admin + Meta Test) (3 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin → Events page | Timeline, event table, filters |
| 2 | Browse store (ViewContent, AddToCart, etc.) | Events appear in Admin |
| 3 | Event Debug Panel | Recent fired events listed |
| 4 | Meta test events (if configured) | Events visible in Meta Events Manager |

---

## 9. Reviews (2 min)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Product page, logged out | “Log in to submit review” |
| 2 | Log in | Order dropdown (delivered orders only) |
| 3 | Select order, rating, comment → Submit | Review saved; verified badge |
| 4 | Duplicate (same order+product) | Error: already reviewed |

---

## 10. Mobile / Responsive

| Step | Action | Expected |
|------|--------|----------|
| 1 | Resize to mobile | Layout stacks; tap targets adequate |
| 2 | Product page sticky CTA | Does not overlap WhatsApp button |
| 3 | Mega menu | Accordion on mobile |

---

## Quick Pass Checklist

- [ ] All storefront routes load
- [ ] Add to Cart / Buy Now work
- [ ] Checkout completes
- [ ] Account orders/invoices visible
- [ ] Admin bulk select + courier booking
- [ ] Track by Order ID and phone
- [ ] Realtime notes update
- [ ] Admin Events view
- [ ] Reviews (login + order dropdown)
- [ ] Mobile layout OK
