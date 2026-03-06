# PR-5: Operational Stability & Observability — Design Plan

**Status:** DRAFT — Awaiting CONFIRM PR-5  
**Date:** 2026-02-26

---

## STEP 1 — READ-ONLY AUDIT

### 1.1 /api/health Route

**File:** `app/api/health/route.ts`

| Aspect | Current |
|--------|---------|
| DB check | `prisma.$queryRaw\`SELECT 1\`` when DATABASE_URL set |
| Env validation | `validateProductionEnv()` in production (DATABASE_URL, NEXTAUTH_SECRET 32+, NEXTAUTH_URL, no demo mode) |
| Response | `{ status, timestamp, database }` — 200 ok, 503 on failure |
| Dynamic | `force-dynamic`, `revalidate: 0` |

**Gaps:** No email/SMS provider check, no uptime, no disk usage.

---

### 1.2 Logging Infrastructure

| Location | Pattern |
|----------|---------|
| Checkout notifications | `console.warn("[checkout] SMS/Email notification failed", { orderId, provider, error })` |
| Health | `console.error("[health] DB check failed:", e)` |
| Admin APIs | `console.error("[api/admin/...] error:", err)` |
| Webhooks | `console.warn/error` with context |
| RBAC | `console.error("Failed to log admin action:", error)` |

**Gaps:** No structured logger; no central failure log; no PII stripping enforced; format varies.

---

### 1.3 NotificationLog Schema

**File:** `prisma/schema.prisma`

```prisma
model NotificationLog {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  tenantId  String
  orderId   String
  type      String   // order_confirmation_email | order_status_sms_confirmed
  channel   String   // email | sms
  recipient String?  // truncated only
  sentAt    DateTime @default(now())
  provider  String?
  messageId String?
  @@unique([tenantId, orderId, type])
}
```

**Gaps:** No `status` (success/failed) or `error` field. Failed sends: record exists, `provider`/`messageId` null. Cannot query "failed" directly.

---

### 1.4 Admin Dashboard Structure

**File:** `app/admin/AdminLayout.tsx`, `lib/admin-config.ts`

- Menu from `/api/admin/menu` or `adminSidebarConfig`
- Dashboard: `/admin` → fetches `/api/admin/dashboard`
- No System Health or Event Debug panels

---

### 1.5 analytics_events Table

**File:** `prisma/schema.prisma`

```prisma
model AnalyticsEvent {
  id             String   @id @default(uuid())
  createdAt      DateTime
  eventName      String
  eventId        String?  @unique  // dedup
  source         String   @default("browser")
  pageUrl        String?
  referrer       String?
  userId         String?
  sessionId      String?
  payloadSummary Json?
}
```

**API:** `GET /api/admin/analytics/events` — supports `from`, `to`, `event`, `source`; returns up to 1000 events. No dedicated "Event Debug" UI with last N + payload + dedup visibility.

---

## STEP 2 — DESIGN PLAN

### 2.1 Admin → System Health Panel

**Route:** `GET /api/admin/system-health` (admin-only)  
**UI:** `/admin/system-health` (new page under Settings or top-level)

| Check | Source | Notes |
|-------|--------|-------|
| DB connectivity | `prisma.$queryRaw\`SELECT 1\`` | Same as health |
| Env validation | `validateProductionEnv()` | Reuse existing |
| Email provider | `!!process.env.RESEND_API_KEY` | Boolean only (no key value) |
| SMS provider | `!!(BULK_SMS_BD_API_KEY \|\| TWILIO_ACCOUNT_SID)` | Boolean only |
| Disk usage | `process.memoryUsage()` or skip | Node heap; avoid `require('fs')` for disk — optional |
| Uptime | `process.uptime()` | Seconds since process start |

**Response shape:**
```json
{
  "database": "connected",
  "env": "ok",
  "emailConfigured": true,
  "smsConfigured": false,
  "uptimeSeconds": 86400,
  "memoryUsageMB": 128
}
```

**Performance:** Single route; no heavy queries. Cache 60s if needed.

---

### 2.2 Admin → Event Debug Panel

**Route:** `GET /api/admin/event-debug` (admin-only)  
**UI:** `/admin/event-debug` (new page)

| Section | Data Source | Limit |
|---------|-------------|-------|
| Last 50 analytics events | `AnalyticsEvent` | `take: 50`, `orderBy: createdAt desc` |
| Last 50 NotificationLogs | `NotificationLog` | `take: 50`, `orderBy: createdAt desc` |
| Failed notifications | `NotificationLog` where `provider IS NULL` and `createdAt` within last 7 days | `take: 50` |
| Dedup visibility | Show `eventId` in analytics; show `(tenantId, orderId, type)` in NotificationLog | Read-only |

**Query strategy:**
- Run 3 queries in parallel: `Promise.all([analytics, notifications, failedNotifications])`
- Each `take: 50` max
- Index on `createdAt` exists for both tables

**UI:** Tables with columns: id, type/eventName, createdAt, provider/eventId, recipient (truncated), payloadSummary (if any). Filter by date range optional.

---

### 2.3 Failure Logging Standardization

**Approach:** Introduce `lib/logger.ts` (or use existing pattern minimally).

| Level | Use |
|-------|-----|
| `logError(scope, message, meta)` | API catch blocks; no PII in meta |
| `logWarn(scope, message, meta)` | Notification failures, validation failures |

**Meta shape:** `{ orderId?, provider?, error?: string }` — never email, phone, name.

**Migration:** Replace `console.error`/`console.warn` in critical paths (checkout notifications, webhooks, health) with `logError`/`logWarn`. Keep `console` for scripts (seed, admin-reset).

**Scope:** Phase 1 — checkout, webhooks, health. Phase 2 — admin APIs if desired.

---

### 2.4 Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Heavy queries | Limit 50 per list; indexed `createdAt` |
| System health | No DB-heavy ops; memory/uptime from process |
| Event debug | Lazy-load; don't block dashboard |
| Caching | Optional 60s cache on system-health |

---

## IMPLEMENTATION ORDER

1. `GET /api/admin/system-health` + `/admin/system-health` page
2. `GET /api/admin/event-debug` + `/admin/event-debug` page
3. `lib/logger.ts` + replace checkout/webhook/health logging
4. (Optional) Add `status`/`error` to NotificationLog in future PR — not required for "failed" inference (provider null)

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `app/api/admin/system-health/route.ts` | New |
| `app/admin/system-health/page.tsx` | New |
| `app/api/admin/event-debug/route.ts` | New |
| `app/admin/event-debug/page.tsx` | New |
| `lib/logger.ts` | New |
| `lib/admin-config.ts` | Add nav items |
| `app/api/checkout/order/route.ts` | Use logger |
| `app/api/health/route.ts` | Use logger (optional) |
| `app/api/webhooks/sslcommerz/route.ts` | Use logger |

---

---

## IMPLEMENTATION COMPLETE (2026-02-26)

**Status:** Implemented per Option B (Full Observability Layer)
