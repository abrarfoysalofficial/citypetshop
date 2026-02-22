# Phase 7 — Reports

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Order Report
- **GET /api/admin/reports/orders** — date range, status filter, CSV export
- **/admin/reports/orders** — summary cards, table, Export CSV

### Expense
- **Expense** model — category, amount, description, date
- **GET/POST /api/admin/expenses** — list, create
- **/admin/reports/expense** — add expense, date filter, total

---

## 2. DB Migrations

- `20260222160000_add_expense` — expenses table

---

## 3. UI Routes

| Path | Purpose |
|------|---------|
| /admin/reports | Reports (existing) |
| /admin/reports/orders | Order Report |
| /admin/reports/expense | Expense tracking |
