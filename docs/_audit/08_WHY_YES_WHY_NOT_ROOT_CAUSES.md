# Why Yes / Why Not — Root Cause Report

**Generated:** March 1, 2026

---

## Auth / RBAC

- **Why it exists:** Middleware checks JWT/demo_session; admin APIs call requireAdminAuth. lib/admin-auth.ts, middleware.ts.
- **Why not more:** Granular permissions via RBAC; menu built from Permission + menuHref. Demo mode for dev without DB.

---

## Catalog (Products, Categories, Brands)

- **Why it exists:** Core e-commerce. Shop page, product page, category routes. Admin CRUD. Seed has sample product, categories.
- **Why not more:** Product 360 view not implemented (GAP_REPORT). Variants exist but storefront display may be basic.

---

## Cart & Checkout

- **Why it exists:** CartContext (client); checkout page with form; order API; voucher validation; SSLCommerz init.
- **Why not more:** Cart is client-side (no Redis). Works for single-session.

---

## Payments

- **Why it exists:** PaymentGateway model; COD, bKash, Nagad, Rocket, SSLCommerz. Admin Payments page. Webhook for SSLCommerz.
- **Why not more:** Wallet credentials in Admin; SSLCommerz needs store ID/password in SecureConfig.

---

## Courier

- **Why it exists:** bookCourier in lib/courier; Steadfast, Pathao. Admin order detail has "Book Courier". CourierBookingLog for idempotency.
- **Why not more:** Pathao requires full credentials. Sandbox mode for testing.

---

## Orders

- **Why it exists:** Order model; checkout creates; admin lists, detail, status change, cancel. OrderStatusEvent for history.
- **Why not more:** Refund is status change (refunded). No dedicated refund workflow.

---

## Track Order + OTP

- **Why it exists:** track-order page; send-otp, verify-otp APIs. TrackOtpVerification, TrackVerifiedToken models.
- **Why not more:** OTP via? (Check implementation for SMS/email.)

---

## Fraud Policy

- **Why it exists:** FraudPolicy model; FraudFlag, BlockedIp, RiskScore. Admin fraud page with policy editor, review queue.
- **Why not more:** Fraud scoring at checkout? Check if integrated.

---

## Audit Log

- **Why it exists:** AuditLog model; lib/audit.ts; createAuditLog in order status, settings, courier, fraud policy.
- **Why not more:** Not all admin mutations log (e.g. product create). Extend as needed.

---

## Blog

- **Why it exists:** CmsPage with template=blog; BlogCategory. Seed has 5 posts. /blog, /blog/[slug]. Static fallback.
- **Why not more:** Complete.

---

## Legal Pages

- **Why it exists:** /terms, /privacy, /refund. Full Bangla content. Footer links.
- **Why not more:** Complete.

---

## SEO

- **Why it exists:** app/sitemap.ts, app/robots.ts. OrganizationSchema, ProductSchema, BlogPostingSchema.
- **Why not more:** Complete.

---

## Analytics

- **Why it exists:** Analytics, AnalyticsEvent models. /api/analytics/events, heartbeat. LiveVisitor for live admin.
- **Why not more:** Complete.

---

## Notifications

- **Why it exists:** NotificationLog for idempotency. Resend for email.
- **Why not more:** SMS not implemented. No admin for notification templates.

---

## Reminders

- **Why it does NOT exist (admin):** Reminder model exists; no admin page. No reminder scheduling UI.
- **Root cause:** CRM phase not fully built. Reminder, ReminderLog, ConversionTracking are schema-only.

---

## Inventory Logs

- **Why it does NOT exist (admin):** InventoryLog model exists; no admin page.
- **Root cause:** Inventory feature partial. No UI to view logs.

---

## HomepageSection

- **Why it does NOT exist (usage):** Model exists; homepage uses HomeBannerSlide, etc.
- **Root cause:** Alternative banner models used. HomepageSection is legacy or planned.
