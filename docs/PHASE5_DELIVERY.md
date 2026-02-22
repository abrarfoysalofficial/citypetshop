# Phase 5 — Customer Management

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Customer Risk Profile
- **GET /api/admin/customers/risk** — customers with duplicate addresses, high COD, multiple orders
- **/admin/customers/risk** — risk table with flags

### Customer Notes (CRM)
- **CustomerNote** model — customerId, message, createdBy
- **GET/POST /api/admin/customer-notes** — list, create

---

## 2. DB Migrations

- `20260222150000_add_customer_note` — customer_notes table

---

## 3. UI Routes

| Path | Purpose |
|------|---------|
| /admin/customers | Manage customers (existing) |
| /admin/customers/repeat | Repeat customers (Phase 2) |
| /admin/customers/risk | Customer risk profile |
