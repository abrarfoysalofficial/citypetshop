# DB Models → Feature Map

**Generated:** March 1, 2026  
**Source:** `prisma/schema.prisma`

---

## Models (65 total)

| Model | Feature | Used By | Seed |
|-------|---------|---------|------|
| Tenant | Multi-tenant | All tenant-scoped models | Yes (default) |
| User | Auth | NextAuth, RBAC | Yes (admin) |
| Account | OAuth | NextAuth | — |
| Session | Auth | NextAuth | — |
| VerificationToken | Auth | NextAuth | — |
| TenantSettings | Store settings | Settings API, storefront | Yes |
| Category | Catalog | Shop, products | Yes |
| Product | Catalog | Shop, cart, checkout | Yes (sample) |
| Order | Orders | Checkout, admin | — |
| OrderItem | Orders | Order | — |
| OrderNote | Orders | Admin order detail | — |
| OrderStatusEvent | Orders | Status flow | — |
| OrderTag | Orders | Admin | — |
| PaymentWebhookLog | Payments | SSLCommerz webhook | — |
| NotificationLog | Notifications | Email/SMS idempotency | — |
| PaymentGateway | Payments | Checkout, admin | Yes |
| Voucher | Discounts | Checkout, admin | — |
| SecureConfig | Secrets | Integrations | — |
| SecureConfigAuditLog | Audit | SecureConfig | — |
| CourierBookingLog | Courier | Courier booking | — |
| CourierConfig | Courier | Courier booking | Yes |
| ProductReview | Reviews | Product page, admin | — |
| Analytics | Analytics | Events API | — |
| AnalyticsEvent | Analytics | Events | — |
| AboutPageProfile | About | About page | Yes |
| TeamMember | About | About page | Yes |
| BlogCategory | Blog | Blog | Yes |
| CmsPage | Blog, CMS | Blog, pages | Yes (blog seed) |
| TrackOtpVerification | Track order | Send OTP | — |
| TrackVerifiedToken | Track order | Verify, track | — |
| Media | Media | Uploads | — |
| HomeBannerSlide | Home | Homepage | — |
| HomeBanner | Home | Homepage | — |
| HomeSideBanner | Home | Homepage | — |
| HomeBottomBanner | Home | Homepage | — |
| ProductRam | Catalog | Product variants | — |
| ProductWeight | Catalog | Product variants | — |
| ProductSize | Catalog | Product variants | — |
| Attribute | Catalog | Variants | — |
| AttributeValue | Catalog | Variants | — |
| ProductVariant | Catalog | Product | — |
| ProductVariantAttribute | Catalog | Variant | — |
| Brand | Catalog | Products | — |
| ProductTag | Catalog | Products | — |
| ProductTagOnProduct | Catalog | Products | — |
| ProductFilter | Catalog | Shop filters | Yes |
| PermissionGroup | RBAC | Menu | Yes |
| Role | RBAC | UserRole | Yes |
| Permission | RBAC | RolePermission | Yes |
| UserRole | RBAC | User | Yes |
| RolePermission | RBAC | Role | Yes |
| AuditLog | Audit | Admin audit page | — |
| SupportTicket | Support | Messages | — |
| TicketMessage | Support | Messages | — |
| ProductImage | Catalog | Product | — |
| HomepageSection | Home | — | **Unused** |
| CheckoutSetting | Checkout | Checkout | — |
| TrackingEvent | Courier | Tracking | — |
| InventoryLog | Inventory | — | **Unused** (no admin) |
| Collection | Catalog | Collections admin | — |
| FlashSaleRule | Promotions | Flash sale API | — |
| LandingPage | Landing | Landing admin | — |
| LandingBlock | Landing | Landing | — |
| Customer | CRM | Customers admin | — |
| CustomerNote | CRM | Customer | — |
| Reminder | CRM | — | **Unused** (no admin) |
| ReminderLog | CRM | Reminder | — |
| ConversionTracking | CRM | — | **Unused** |
| Expense | Reports | Expense admin | — |
| CampaignPerformance | Ads | Ad management | — |
| Conversation | Messaging | — | **Partial** (Messages?) |
| ConversationMessage | Messaging | Conversation | — |
| DraftOrder | Checkout | Draft orders admin | — |
| FraudPolicy | Fraud | Fraud admin | Yes |
| FraudFlag | Fraud | Fraud admin | — |
| BlockedIp | Fraud | Fraud admin | — |
| RiskScore | Fraud | Customer risk | — |
| LiveVisitor | Analytics | Live admin | — |

---

## Seed Coverage

| Status | Models |
|--------|--------|
| **Seeded** | Tenant, TenantSettings, User (admin), Role, Permission, UserRole, RolePermission, Category, Product (sample), PaymentGateway, FraudPolicy, ProductFilter, AboutPageProfile, TeamMember, BlogCategory, CmsPage (blog) |
| **Partially seeded** | — |
| **Not seeded but required** | Most operational models (Order, etc.) — populated at runtime |

---

## Unused Models

- **HomepageSection** — No admin UI; homepage uses HomeBannerSlide, etc.
- **InventoryLog** — Model exists; no admin UI for inventory logs.
- **Reminder** — CRM model; no reminder admin.
- **ConversionTracking** — No admin UI.
