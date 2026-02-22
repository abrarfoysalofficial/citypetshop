# Phase 0 — Feature Inventory + Parity Matrix

**Date:** 2026-02-22  
**Scope:** Admin panel (/admin) and backend — feature parity against reference UI  
**Rule:** NO CODE in Phase 0. Inventory and planning only.

---

## 1. Feature Parity Matrix

| Reference Module | Submodule | Current Status | Route/UI Path | API Endpoint | DB Model(s) | Notes |
|------------------|-----------|----------------|---------------|--------------|-------------|-------|
| **Order Management** | Create Order | **Exists** | /admin/orders/create | POST /api/admin/orders/create | Order, OrderItem | Phase 2 |
| | Orders | **Exists** | /admin/orders | GET /api/admin/orders | Order, OrderItem | List + tabs (Pending/Accepted/Rejected/Booking/Packing/Collection) |
| | Collection | **Exists** | /admin/orders?tab=collection | GET /api/admin/orders | Order | Tab filter |
| | Booking | **Exists** | /admin/orders?tab=booking | GET /api/admin/orders | Order | Tab filter; /admin/courier for booking |
| | Packing | **Exists** | /admin/orders?tab=packing | GET /api/admin/orders | Order | Tab filter |
| | Order Tracking | **Partial** | /admin/orders/[id], /track-order | — | Order, TrackingEvent | Order detail + track-order |
| | Incomplete Orders | **Exists** | /admin/draft-orders | GET /api/admin/draft-orders | DraftOrder | Abandoned checkout |
| | Courier Mismatch | **Missing** | — | — | — | Detect/resolve courier assignment mismatches |
| | Order Activities | **Exists** | /admin/orders/activities | GET /api/admin/orders/activities | OrderNote, OrderStatusEvent | Phase 2 |
| | Repeat Customer | **Exists** | /admin/customers/repeat | GET /api/admin/customers/repeat | Order | Phase 2 |
| **Product Management** | Products | **Exists** | /admin/products | Full CRUD /api/admin/products | Product, ProductImage, ProductVariant | CSV import/export |
| | Category Tree | **Exists** | /admin/categories | Full CRUD /api/admin/categories | Category | Nested via parentId; tree UI partial |
| | Stock Management | **Exists** | /admin/inventory | GET/PATCH /api/admin/products/stock | Product, InventoryLog | Low stock; ledger partial |
| | Product Filters | **Missing** | — | — | — | Configurable filters (e.g. price range, brand) |
| | Brands | **Exists** | /admin/brands | Full CRUD /api/admin/brands | Brand | |
| | Shipping | **Partial** | — | — | — | SiteSettings.delivery*; no per-product shipping |
| | Units | **Partial** | /admin/products/sizes, weights, rams | CRUD /api/admin/product-* | ProductSize, ProductWeight, ProductRam | Legacy attribute tables; no generic "Units" |
| | Coupons | **Exists** | /admin/vouchers | Full CRUD /api/admin/vouchers | Voucher | |
| | Product Catalogs | **Exists** | — | Full CRUD /api/admin/collections | Collection | No admin UI for collections |
| **Pages** | Landing Page | **Exists** | /admin/landing-pages | Full CRUD /api/admin/landing-pages | LandingPage, LandingBlock | Section-based builder |
| | Site Pages | **Stub** | /admin/pages | — | CmsPage | Placeholder; "Connect backend" |
| | Blogs | **Exists** | /admin/blog | — | CmsPage (template=blog) | Blog CRUD via CMS |
| | Blog Categories | **Missing** | — | — | — | No blog category model/UI |
| **User/Customer Management** | My Customers | **Partial** | — | — | — | Unclear; may map to /admin/customers |
| | Manage Customers | **Exists** | /admin/customers | Full CRUD /api/admin/customers | Customer | CRM notes/tags partial |
| | Stock Management | **Exists** | /admin/inventory | — | Product, InventoryLog | See Product Management |
| **Social Automation** | Dashboard | **Exists** | /admin | GET /api/admin/dashboard | — | Stats, charts |
| | Message Inbox | **Exists** | /admin/messages | GET/PATCH /api/admin/conversations | Conversation, ConversationMessage | Multi-channel stubs; AI draft |
| | Ad Management | **Missing** | — | — | CampaignPerformance | DB model exists; no admin UI |
| | Global AI | **Partial** | /admin/messages (AI draft) | POST /api/admin/conversations/[id] | — | AI draft replies; no dedicated "Global AI" settings |
| **Reports** | Sales Report | **Partial** | /admin/reports | GET /api/admin/reports/sales | Order | Summary cards; demo chart |
| | Order Report | **Missing** | — | — | Order | Dedicated order report with filters |
| | Expense | **Missing** | — | — | — | No expense model/UI |
| | Visitor Analytics | **Exists** | /admin/analytics, /admin/analytics/live | GET /api/admin/analytics/* | AnalyticsEvent, LiveVisitor | Events + live visitors |
| **Settings** | Website Settings | **Exists** | /admin/settings | GET/PATCH /api/admin/settings | SiteSettings | |
| | Other Settings | **Partial** | /admin/advanced-settings | — | SiteSettings.advancedSettings | JSON-based |
| | Menu Settings | **Stub** | /admin/menus | — | SiteSettings.navbarLinks | Placeholder; "Connect backend" |
| | Contact Settings | **Partial** | /admin/settings | — | SiteSettings (phone, email, address) | In main settings |
| | IP Restrictions | **Exists** | /admin/fraud | GET/POST /api/admin/fraud | BlockedIp | Block IPs |

---

## 2. Admin Menu Map (Current vs Reference)

### Current Sidebar (lib/admin-config.ts)

```
Dashboard
Home Banner Slides
Category
Products
  ├─ Product List
  ├─ Product Upload
  ├─ Add Product RAMS
  ├─ Add Product WEIGHT
  ├─ Add Product SIZE
Orders
Home Banners
Home Side Banners
Home Bottom Banners
Settings & More
  ├─ Store Settings
  ├─ Checkout Settings
  ├─ Payments
  ├─ Analytics
  ├─ Live Visitors
  ├─ Blog
  ├─ Customers
  ├─ Vouchers
  ├─ Landing Pages
  ├─ Abandoned Checkout
  ├─ Fraud & Security
  ├─ Courier
  ├─ Team
```

### Reference UI Target Structure

```
ORDER MANAGEMENT
  ├─ Create Order
  ├─ Orders
  ├─ Collection
  ├─ Booking
  ├─ Packing
  ├─ Order Tracking
  ├─ Incomplete Orders
  ├─ Courier Mismatch
  ├─ Order Activities
  └─ Repeat Customer

PRODUCT MANAGEMENT
  ├─ Products
  ├─ Category Tree
  ├─ Stock Management
  ├─ Product Filters
  ├─ Brands
  ├─ Shipping
  ├─ Units
  ├─ Coupons
  └─ Product Catalogs

PAGES
  ├─ Landing Page
  ├─ Site Pages
  ├─ Blogs
  └─ Blog Categories

USER/CUSTOMER MANAGEMENT
  ├─ My Customers
  ├─ Manage Customers
  └─ Stock Management (if present)

SOCIAL AUTOMATION
  ├─ Dashboard
  ├─ Message Inbox
  ├─ Ad Management
  └─ Global AI

REPORTS
  ├─ Sales Report
  ├─ Order Report
  ├─ Expense
  └─ Visitor Analytics

SETTINGS
  ├─ Website Settings
  ├─ Other Settings
  ├─ Menu Settings
  ├─ Contact Settings
  └─ IP Restrictions
```

---

## 3. Gap Summary (What Must Be Built)

### Order Management
- [ ] Create Order (manual order entry form)
- [ ] Collection queue (orders ready for collection)
- [ ] Packing queue (orders in packing)
- [ ] Courier Mismatch detection + resolution
- [ ] Order Activities (dedicated log view)
- [ ] Repeat Customer view (metrics, COD flags)

### Product Management
- [ ] Product Filters (configurable filter definitions)
- [ ] Shipping per product/class (extend Product or new model)
- [ ] Units management (generic, not just size/weight/ram)
- [ ] Product Catalogs admin UI (collections)

### Pages
- [ ] Site Pages CRUD (wire CmsPage)
- [ ] Blog Categories (model + UI)

### User/Customer Management
- [ ] My Customers vs Manage Customers (clarify; may merge)
- [ ] Customer risk profile (duplicate phone/address, COD history)

### Social Automation
- [ ] Ad Management UI (CampaignPerformance)
- [ ] Global AI settings (safe mode, logging)

### Reports
- [ ] Order Report (dedicated, with filters)
- [ ] Expense tracking (model + UI)

### Settings
- [ ] Menu Settings (wire navbar/footer to DB)
- [ ] Other Settings (structured, not just JSON)

---

## 4. Existing Routes Not in Reference (Keep for Parity)

- Home Banner Slides, Home Banners, Home Side/Bottom Banners
- Product Upload, RAMS, WEIGHT, SIZE
- Team, Roles-Permissions, Attributes, Product Tags
- Combo Offers, Offers, Theme
- Invoices, Tracking, Emails
- Checkout Settings, Payments, Courier
- Advanced Settings, Tools

**Rule:** Preserve all. Add new; do not remove.

---

## 5. DB Models Inventory

| Model | Purpose |
|-------|---------|
| User, Account, Session, VerificationToken | Auth |
| Role, Permission, UserRole, RolePermission | RBAC |
| AuditLog | Audit |
| Category | Categories (nested) |
| Product, ProductImage, ProductVariant, ProductVariantAttribute | Products |
| Attribute, AttributeValue | Variant attributes |
| ProductRam, ProductSize, ProductWeight | Legacy units |
| Brand | Brands |
| ProductTag, ProductTagOnProduct | Tags |
| Order, OrderItem, OrderNote, OrderStatusEvent, OrderTag | Orders |
| PaymentGateway, PaymentWebhookLog | Payments |
| Voucher | Coupons |
| CourierConfig, TrackingEvent | Shipping |
| ProductReview | Reviews |
| CmsPage | CMS/Blog |
| LandingPage, LandingBlock | Landing pages |
| HomeBannerSlide, HomeBanner, HomeSideBanner, HomeBottomBanner | Homepage |
| SiteSettings, CheckoutSetting | Settings |
| Collection | Collections |
| FlashSaleRule | Flash sales |
| InventoryLog | Inventory ledger |
| Analytics, AnalyticsEvent, LiveVisitor | Analytics |
| Customer, Reminder, ReminderLog, ConversionTracking | CRM |
| CampaignPerformance | Ad campaigns |
| Conversation, ConversationMessage | Messaging |
| DraftOrder | Abandoned checkout |
| FraudPolicy, FraudFlag, BlockedIp, RiskScore | Fraud |
| SupportTicket, TicketMessage | Support |
| Media | Media refs |
| TrackOtpVerification, TrackVerifiedToken | Order tracking OTP |

**Missing for reference:** Expense, BlogCategory, ProductFilter (config), ShippingZone/Rate (per product).

---

## 6. Phase Implementation Order

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **Phase 1** | Foundation | Auth, RBAC, Audit, Menu from PermissionGroups |
| **Phase 2** | Order Management | Create Order, queues, tracking, activities, repeat customer |
| **Phase 3** | Product Management | Filters, shipping, units, catalogs UI |
| **Phase 4** | Pages/CMS | Site pages, blog categories |
| **Phase 5** | Customer Management | My/Manage customers, risk profile |
| **Phase 6** | Social Automation | Ad Management, Global AI |
| **Phase 7** | Reports | Order report, Expense |
| **Phase 8** | Settings + Hardening | Menu settings, IP, runbooks |

---

**End of Phase 0. No code changes.**
