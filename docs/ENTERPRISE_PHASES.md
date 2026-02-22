# City Plus Pet Shop – Enterprise Smart Commerce Platform

## Master Implementation Plan

**Stack:** Next.js 14 (App Router) + TypeScript + PostgreSQL + Tailwind + Radix UI  
**Hosting:** CyberPanel (OpenLiteSpeed) + PM2  
**Database:** PostgreSQL (single source of truth)

---

## Global Non-Negotiable Rules

1. PostgreSQL is the single source of truth
2. Every feature must be DB-backed
3. No fake UI or static placeholder
4. Admin must have RBAC
5. System must be mobile-first and fast
6. Lighthouse mobile score >= 90
7. No deployment if tests fail
8. All tracking must support browser + server-side
9. Fraud detection must work before order confirmation

---

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Performance Engine | In Progress |
| 2 | Smart Order Management | Pending |
| 3 | Smart Product Management | Pending |
| 4 | Landing Page Builder | Pending |
| 5 | Smart CRM System | Pending |
| 6 | Catalog Ad Manager | Pending |
| 7 | AI + Human Message Automation | Pending |
| 8 | Smart Pixel & Analytics | Pending |
| 9 | Incomplete Order Management | Pending |
| 10 | Advanced Fraud Engine | Pending |
| 11 | Real-Time Data Analytics | Pending |

---

## Phase 1 – Performance Engine ✅

**Target:** 0.3–0.9 second load on optimized pages

### 1) DB Schema
- No new tables
- Optional: `cache_config` in `site_settings` JSON for TTL overrides (future)

### 2) API Endpoints
- No new APIs for Phase 1

### 3) Implemented File Changes
| File | Change |
|------|--------|
| `next.config.js` | `formats: ["image/avif", "image/webp"]`, `optimizePackageImports` for recharts/framer-motion, `compiler.removeConsole` |
| `app/layout.tsx` | Added `PreloadLinks`, `PreloadCriticalRoutes` |
| `components/PreloadLinks.tsx` | **NEW** – Predictive prefetch on hover/focus, idle prefetch for /shop, /cart, etc. |
| `components/media/OptimizedImage.tsx` | **NEW** – Lazy load, WebP/AVIF via Next Image, priority for LCP |
| `lib/cache.ts` | **NEW** – HTTP Cache-Control presets (STATIC, PRODUCT_LIST, HOMEPAGE, NONE) |
| `app/page.tsx` | `revalidate = 120` (2 min) |
| `app/shop/page.tsx` | `revalidate = 300` (5 min) |

### 4) Security Notes
- Prefetch only same-origin routes; `/admin`, `/api`, `/auth` skipped
- No sensitive data in prefetch
- Auth routes remain `no-store`

### 5) Performance Considerations
- Prefetch on `mouseenter`/`focusin` for all `<a>` links
- `PreloadCriticalRoutes` prefetches /shop, /cart, /checkout, etc. on idle
- Homepage/shop use ISR with revalidate
- Use `OptimizedImage` with `priority={true}` for LCP hero image

### 6) Testing Checklist
- [ ] Lighthouse mobile >= 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 200KB initial JS

### 7) Risk Analysis
- **Low:** Prefetch increases bandwidth; acceptable for critical routes
- **Low:** Revalidate may serve stale data; 2–5 min is acceptable for product lists

---

## Phase 2 – Smart Order Management

### 1) DB Schema
```sql
-- Extend existing orders, order_items, order_notes
-- Add order_tags, order_status_history
order_tags (order_id, tag, created_at)
order_status_history (order_id, from_status, to_status, actor_id, note, created_at)
```

### 2) API Endpoints
- `GET/PATCH /api/admin/orders/:id` – central dashboard
- `POST /api/admin/orders/:id/confirm`
- `POST /api/admin/orders/:id/cancel`
- `POST /api/admin/orders/:id/dispatch`
- `GET/POST /api/admin/orders/:id/tags`
- `GET /api/admin/reports/sales`
- `GET /api/admin/reports/delivery`
- `GET /api/admin/reports/returns`

### 3) Security
- RBAC: orders.view, orders.edit, orders.dispatch
- Audit log for status changes

### 4) Risk
- **Medium:** Status workflow conflicts; use optimistic locking

---

## Phase 3 – Smart Product Management

### 1) DB Schema
- Extend `product_variants`, `product_images`
- `inventory_logs` (product_id, type, qty, ref_id, created_at)
- `collections` (id, slug, name, products JSON)
- `flash_sale_rules` (product_id, start_at, end_at, discount_pct)

### 2) API Endpoints
- Variation CRUD, bulk CSV import
- Low stock alerts (cron + DB)
- Best-selling aggregation

---

## Phase 4 – Landing Page Builder

### 1) DB Schema
```sql
landing_pages (id, slug, title, layout_json, is_published, created_at)
landing_blocks (id, page_id, type, config_json, sort_order)
block_types (id, name, schema_json) -- registry
```

### 2) Features
- Drag-drop JSON layout
- Hero, countdown, product grid, review blocks
- Real-time preview

---

## Phase 5 – Smart CRM System

### 1) DB Schema
```sql
customers (extend from orders or new)
reminders (customer_id, type, scheduled_at, channel, template_id)
reminder_logs (reminder_id, sent_at, status)
conversion_tracking (reminder_id, order_id, revenue)
```

### 2) Channels
- SMS (Twilio), WhatsApp (API), Email (Resend)

---

## Phase 6 – Catalog Ad Manager

- Product feed generator (Meta/TikTok/Google)
- `GET /api/feeds/meta`, `/api/feeds/tiktok`, `/api/feeds/google`
- `campaign_performance` table

---

## Phase 7 – AI + Human Message Automation

- Conversation logs in DB
- Product-aware AI (RAG over products)
- Order intent detection, human escalation flag

---

## Phase 8 – Smart Pixel & Analytics

- Facebook CAPI, GA4 Measurement Protocol
- Server-side event API
- Funnel, ROI dashboard

---

## Phase 9 – Incomplete Order Management

- `draft_orders` or `orders.status = 'draft'`
- Abandoned checkout detection (cron)
- Reminder triggers

---

## Phase 10 – Advanced Fraud Engine

### 1) DB Schema
```sql
fraud_flags (order_id, flag_type, score, details_json)
blocked_ips (ip, reason, expires_at)
risk_scores (entity_type, entity_id, score, factors_json)
```

### 2) Checks
- Duplicate phone/address
- Velocity, IP blacklist
- OTP for COD
- Pre-confirmation validation

---

## Phase 11 – Real-Time Data Analytics

- Live visitor count (WebSocket or polling)
- Page traffic, funnel, revenue, geo
- Dashboard with real-time refresh

---

## Security (Cross-Phase)

- RBAC: Admin / Manager / Staff
- Rate limit: login, checkout, OTP
- Hash OTP with expiry
- Audit logs for all actions
- Secure headers (CSP, HSTS)
- Idempotency key for payments

---

## Quality Gates

Deployment fails if:
- TypeScript errors
- ESLint errors
- Unit tests fail
- E2E fail
- Fraud detection test fails
- Payment verification fails
