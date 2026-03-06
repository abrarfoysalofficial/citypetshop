# Missing / Incomplete / Unused Report

**Generated:** March 1, 2026

---

## 1. Missing (feature has plan/docs but no implementation)

| Item | Why | Impact | Location | Fix |
|------|-----|--------|----------|-----|
| Reminder admin UI | Model exists; no admin page | Cannot manage cart abandonment, follow-ups | prisma/schema.prisma (Reminder) | Add /admin/reminders page |
| Inventory log admin | Model exists; no admin page | Cannot view inventory history | prisma/schema.prisma (InventoryLog) | Add /admin/inventory or extend existing |
| Product 360 view | GAP_REPORT lists | Lower product engagement | — | Optional; low priority |
| Queue/Worker for courier, payment | GAP_REPORT lists | Sync processing; no async | — | Add BullMQ or similar |
| admin subdomain | GAP_REPORT lists | Admin at /admin | — | Design decision; N/A |

---

## 2. Incomplete (partial UI/API/DB, not end-to-end)

| Item | Why | Impact | Location | Fix |
|------|-----|--------|----------|-----|
| Search | SearchStrip exists; no backend search API | Client-side filter only | components/home/SearchStrip | Add /api/search or use by-subcategory |
| Notifications/SMS | NotificationLog exists; Resend for email | SMS not implemented | — | Add SMS provider (Twilio, etc.) |
| Flash sale storefront | API exists; no storefront UI | Flash sale rules not visible to customers | app/api/admin/flash-sale | Add flash sale section to shop |
| Conversations/Messages | Model exists; Messages admin may be partial | Support ticket flow | app/admin/messages | Verify full CRUD |
| HomepageSection | Model exists; homepage uses banners | HomepageSection unused | prisma/schema.prisma | Use or remove |

---

## 3. Unused (code/models/pages exist but unreachable or not referenced)

| Item | Why | Impact | Location | Fix |
|------|-----|--------|----------|-----|
| /admin/offers | Not in sidebar | Orphan page | app/admin/offers/page.tsx | Add to sidebar or remove |
| /admin/status | Not in sidebar | Orphan | app/admin/status/page.tsx | Add or remove |
| /admin/tools | Not in sidebar | Orphan | app/admin/tools/page.tsx | Add or remove |
| /admin/entertainment | Storefront; purpose unclear | Orphan | app/entertainment/page.tsx | Remove or document |
| /admin/payment-failed | Duplicate of /payment/failed? | Confusion | app/payment-failed/page.tsx | Redirect to /payment/failed |
| HomepageSection model | No usage | Dead schema | prisma/schema.prisma | Remove or implement |
| ConversionTracking model | No admin | Dead schema | prisma/schema.prisma | Remove or implement |
| /api/status | Unclear usage | Possibly monitoring | app/api/status/route.ts | Document or remove |
| /api/feeds/google, meta | May be cron | Unclear | app/api/feeds | Document |
| /site-map | Not in footer | Orphan route | app/site-map/page.tsx | Add footer link |

---

## 4. Duplicate / Legacy

| Item | Why | Resolution |
|------|-----|------------|
| terms-conditions, privacy-policy, refund-return-policy | Redirect to /terms, /privacy, /refund | Keep redirects for SEO |
| my-account/* | Redirect to /account/* | Keep redirects |
| about-us, contact-us | Redirect to /about, /contact | Keep redirects |
| /admin/couriers vs /admin/courier | Both exist | Consolidate or document |
| /admin/payment-methods vs /admin/payments | Both exist | Consolidate |
