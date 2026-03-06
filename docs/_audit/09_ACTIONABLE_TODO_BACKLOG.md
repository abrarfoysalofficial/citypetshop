# Actionable TODO Backlog

**Generated:** March 1, 2026

---

## P0 — Blocks Production / Security

| ID | Item | Acceptance Criteria | Files | Verification |
|----|------|---------------------|-------|--------------|
| P0-1 | No secrets in repo | .env in .gitignore; MUST_REPLACE_SECRETS reviewed | .gitignore, docs/ | Manual review |
| P0-2 | Admin protected | Unauthorized cannot access /admin | middleware.ts, admin-auth.ts | Visit /admin without login → redirect |
| P0-3 | Build passes | npm run build exit 0 | — | npm run build |

---

## P1 — Blocks Conversion / Checkout

| ID | Item | Acceptance Criteria | Files | Verification |
|----|------|---------------------|-------|--------------|
| P1-1 | Checkout flow end-to-end | Place order, receive confirmation | app/checkout, api/checkout | Manual test |
| P1-2 | Payment webhook | SSLCommerz webhook processes | api/webhooks/sslcommerz | Test payment |
| P1-3 | Track order works | OTP send, verify, show status | app/track-order, api/track-order | Manual test |

---

## P2 — SEO / Ops Improvements

| ID | Item | Acceptance Criteria | Files | Verification |
|----|------|---------------------|-------|--------------|
| P2-1 | Add site-map to footer | Footer links to /site-map | components/home/HomeFooter.tsx | Visual check |
| P2-2 | Consolidate orphan admin pages | Add to sidebar or remove | lib/admin-config.ts, app/admin/* | Build, dev |
| P2-3 | Remove /entertainment if unused | 404 or redirect | app/entertainment | Build |
| P2-4 | Consolidate payment-failed | Single /payment/failed | app/payment-failed | Redirect to /payment/failed |
| P2-5 | Document feeds API | When/how to use | docs/ | — |
| P2-6 | Reminder admin (optional) | Admin page for Reminder model | app/admin/reminders | If CRM needed |
| P2-7 | Inventory log admin (optional) | View InventoryLog | app/admin/inventory | Extend existing |

---

## Verification Steps (All Items)

1. `Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue`
2. `npm run build` (exit 0)
3. `npm run dev` (starts)
4. `npm run smoke` (if configured)
