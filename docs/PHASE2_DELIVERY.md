# Phase 2 — Order Management

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Create Order
- **POST /api/admin/orders/create** — manual order creation with Zod validation, Prisma transaction
- **/admin/orders/create** — form with product search, customer/shipping fields, line items, totals

### Orders List
- Status tabs: All, Pending, Accepted, Rejected, Booking, Packing, Collection
- Search by name, phone, email (server-side)
- Create Order button in header

### Queues (via tab filter)
- **Booking** — orders with status `pending` (need courier booking)
- **Packing** — orders with status `processing`
- **Collection** — orders with status `shipped` or `handed_to_courier`

### Order Activities
- **GET /api/admin/orders/activities** — combined notes + status events
- **/admin/orders/activities** — global activities log

### Repeat Customer
- **GET /api/admin/customers/repeat** — customers with 2+ orders, COD stats
- **/admin/customers/repeat** — table with order count, total spent, last order, COD risk, WhatsApp link

### Permissions
- `orders.create` — create orders
- `orders.activities` — view order activities
- `customers.repeat` — view repeat customers

---

## 2. DB Migrations

No new migrations for Phase 2. Uses existing Order, OrderItem, OrderNote, OrderStatusEvent.

---

## 3. API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/admin/orders/create | orders.create | Manual order creation |
| GET | /api/admin/orders | requireAdminAuth | List orders (tab, search) |
| GET | /api/admin/orders/activities | requireAdminAuth | Order activities (notes + events) |
| GET | /api/admin/customers/repeat | requireAdminAuth | Repeat customers |

---

## 4. UI Routes

| Path | Purpose |
|------|---------|
| /admin/orders | Orders list with tabs |
| /admin/orders/create | Create Order form |
| /admin/orders/activities | Order Activities log |
| /admin/customers/repeat | Repeat Customer view |

---

## 5. Verification Checklist

1. Visit /admin/orders → see tabs (All, Pending, Booking, etc.)
2. Click Create Order → add products, fill customer, submit → redirect to order detail
3. Visit /admin/orders/activities → see notes and status events
4. Visit /admin/customers/repeat → see customers with 2+ orders

---

## 6. Rollback Plan

```bash
git checkout -- app/api/admin/orders/ app/admin/orders/
git checkout -- app/api/admin/customers/repeat/ app/admin/customers/repeat/
rm -rf app/api/admin/orders/create app/api/admin/orders/activities app/api/admin/customers/repeat
```
