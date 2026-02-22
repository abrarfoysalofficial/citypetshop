# Phase 0 — Audit Report

**See also:** [PHASE0_FEATURE_PARITY_MATRIX.md](./PHASE0_FEATURE_PARITY_MATRIX.md) for the full Feature Parity Matrix and Admin Menu Map.

## 1. Current Prisma Models

| Model | Purpose |
|-------|---------|
| User, Account, Session, VerificationToken | Auth (NextAuth credentials) |
| SiteSettings | Store config, delivery, homepage blocks |
| Category | Product categories (parent/child) |
| Product, ProductImage, ProductVariant, ProductTag, ProductTagOnProduct | Catalog |
| ProductRam, ProductSize, ProductWeight | Legacy attribute tables |
| Attribute, AttributeValue, ProductVariantAttribute | Variant attributes |
| Brand | Brands (referenced by Product) |
| Order, OrderItem, OrderNote, OrderStatusEvent, OrderTag | Orders |
| PaymentWebhookLog, PaymentGateway | Payments |
| Voucher | Coupons |
| CourierConfig, TrackingEvent | Shipping |
| ProductReview | Reviews |
| Analytics, AnalyticsEvent | Analytics |
| CmsPage | Blog/CMS |
| TrackOtpVerification, TrackVerifiedToken | Order tracking OTP |
| Media | Media references |
| HomeBannerSlide, HomeBanner, HomeSideBanner, HomeBottomBanner | Homepage |
| Role, Permission, UserRole, RolePermission | RBAC |
| AuditLog | Admin audit (userId, action, resource, resourceId, oldValues, newValues, ipAddress, userAgent) |
| SupportTicket, TicketMessage | Support |
| InventoryLog, Collection, FlashSaleRule | Inventory/marketing |
| LandingPage, LandingBlock | Landing pages |
| Customer, Reminder, ReminderLog, ConversionTracking | CRM |
| CampaignPerformance | Ads |
| Conversation, ConversationMessage | Messaging |
| DraftOrder | Abandoned checkout |
| FraudPolicy, FraudFlag, BlockedIp, RiskScore | Fraud |
| LiveVisitor | Live analytics |
| CheckoutSetting | Checkout config |

## 2. Existing Auth Approach

- **NextAuth v4** with Credentials provider
- **User.role**: `"admin"` | `"user"` (legacy string)
- **RBAC**: Role, Permission, UserRole, RolePermission tables
- **admin-auth.ts**: `requireAdminAuth()` checks session + `hasPermission(userId, "admin.view")`
- **Demo mode**: `demo_session` cookie bypasses RBAC (userId: "demo-admin")
- **Middleware**: Protects `/admin/*` via JWT `role` in ["admin","adm"] (Prisma) or `demo_session` (demo)
- **Gap**: Middleware uses role string; API uses RBAC. Demo user has no DB record so RBAC would fail — demo returns early.

## 3. Order/Cart Flow

- **Cart**: Client-side (CartContext), no DB
- **Checkout**: POST `/api/checkout/order` → creates Order + OrderItems in Prisma
- **Order creation**: Validates with Zod, optional fraud check, creates Order with status `pending`

## 4. Existing Admin Pages

| Path | Status |
|------|--------|
| /admin, /admin/dashboard | Dashboard (charts, stats) |
| /admin/login | Credentials login |
| /admin/products | CRUD table + create modal |
| /admin/products/[id]/edit | Edit product |
| /admin/products/new | New product |
| /admin/products/bulk | Bulk CSV add (uses ProductsContext — local, not Prisma) |
| /admin/products/bulk-import | Redirects to bulk |
| /admin/categories | CRUD |
| /admin/brands | Placeholder ("Connect backend for CRUD") |
| /admin/orders | Order list |
| /admin/orders/[id] | Order detail |
| /admin/audit-logs | Table (uses getAdminAuditLogs — returns [] in Prisma) |
| /admin/vouchers, settings, fraud, etc. | Various |

## 5. Gaps

| Gap | Severity |
|-----|----------|
| getAdminAuditLogs returns [] — never reads Prisma AuditLog | High |
| logAdminAction sets ipAddress/userAgent = null | Medium |
| No Brands API | High |
| Bulk import uses local context, not Prisma | High |
| No CSV export for products | Medium |
| Products/categories APIs lack Zod validation | Medium |
| Audit logging not called in products/categories CRUD | Medium |
| "Owner" role not in seed (super_admin used instead) | Low |

## 6. Proposed Data Model (Phase 1–2)

No schema changes for Phase 1–2. Use existing:
- AuditLog (add index on userId if needed)
- Role, Permission, UserRole, RolePermission
- Product, Category, Brand

## 7. Endpoint Map (Phase 1–2)

| Method | Path | Phase | Purpose |
|--------|------|-------|---------|
| GET | /api/admin/audit-logs | 1 | List audit logs (paginated) |
| GET | /api/admin/brands | 2 | List brands |
| POST | /api/admin/brands | 2 | Create brand |
| PATCH | /api/admin/brands/[id] | 2 | Update brand |
| DELETE | /api/admin/brands/[id] | 2 | Delete brand |
| POST | /api/admin/products/import | 2 | CSV bulk import |
| GET | /api/admin/products/export | 2 | CSV export |

## 8. UI Sitemap (Phase 1–2)

- /admin/audit-logs — wire to Prisma, add pagination/filter
- /admin/brands — full CRUD form + table
- /admin/products/bulk — wire to Prisma import API

---

## Phase 1 & 2 Implementation Summary

### Phase 1 (Completed)
- `getAdminAuditLogs` in provider-db.ts now reads from Prisma AuditLog
- `/api/admin/audit-logs` GET — paginated list
- `logAdminAction` in rbac.ts now accepts `requestOrMeta` for ip/userAgent
- Seed: added `owner` role with full permissions; admin user gets owner + super_admin
- Audit logging on products/categories create/update/delete

### Phase 2 (Completed)
- `/api/admin/brands` GET, POST
- `/api/admin/brands/[id]` PATCH, DELETE
- Admin brands page: full CRUD form + table
- `/api/admin/products/import` POST — CSV or JSON bulk import
- `/api/admin/products/export` GET — CSV export
- Admin products bulk page: uses import API; Export CSV button
- Seed: brands.view, brands.create, brands.edit, brands.delete permissions

### Verification

```bash
# 1. Run migrations (if any new)
npx prisma migrate deploy

# 2. Seed (creates owner role, assigns to admin)
npx prisma db seed

# 3. Build
npm run build

# 4. Dev
npm run dev
```

- Visit /admin/login → sign in with admin credentials
- Visit /admin/audit-logs → should show entries (after creating/editing products)
- Visit /admin/brands → should show brands CRUD; create a brand
- Visit /admin/products/bulk → upload CSV; preview; Import; check Export CSV

### Rollback

```bash
# Revert code
git checkout -- src/data/provider-db.ts lib/rbac.ts prisma/seed.ts
git checkout -- app/api/admin/audit-logs/ app/api/admin/brands/
git checkout -- app/api/admin/products/route.ts app/api/admin/categories/route.ts
git checkout -- app/api/admin/products/import/ app/api/admin/products/export/
git checkout -- app/admin/brands/page.tsx app/admin/products/bulk/page.tsx

# Remove new files
rm -rf app/api/admin/audit-logs app/api/admin/brands app/api/admin/products/import app/api/admin/products/export

# DB: owner role is additive; no migration to revert. To remove owner role:
# DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE name='owner');
# DELETE FROM user_roles WHERE role_id IN (SELECT id FROM roles WHERE name='owner');
# DELETE FROM roles WHERE name='owner';
```
