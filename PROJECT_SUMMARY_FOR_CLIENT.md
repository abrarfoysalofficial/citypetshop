# City Plus Pet Shop — Full Project Summary for Client

**Document Purpose:** A-Z overview of all features, capabilities, and what can be done with the platform. Use this for client handover, training, or documentation.

---

## 1. Project Overview

| Item | Value |
|------|-------|
| **Project Name** | City Plus Pet Shop BD |
| **Type** | E-commerce website for pet supplies in Bangladesh |
| **Tech Stack** | Next.js 14 (App Router), TypeScript, Tailwind CSS, PostgreSQL, Prisma |

**What it is:** A full-featured e-commerce platform with admin panel for managing products, orders, payments, customers, analytics, and marketing. Built for Bangladesh market with support for COD, bKash, Nagad, Rocket, SSLCommerz, and local courier integration.

---

## 2. Customer-Facing (Storefront) Features

### 2.1 Homepage
| Feature | What It Does | Why |
|---------|--------------|-----|
| **Hero Slider** | Rotating banner images with links | Promotes campaigns, new arrivals |
| **Category Mega Menu** | Browse categories with subcategories | Easy navigation |
| **Featured Products** | Admin-selected products | Highlight best sellers |
| **Flash Sale** | Time-limited discounted products | Drive urgency |
| **Clearance** | Products on clearance | Clear inventory |
| **Combo Offers** | Bundled product deals | Increase basket value |
| **Top Sellers** | Popular products by sales | Social proof |
| **Popular Categories** | Category chips with quick links | Quick browsing |
| **Trust Bar** | Promises (authentic, fast delivery, etc.) | Build trust |
| **Why Choose Us** | Value propositions | Differentiate |
| **Reviews Section** | Customer reviews | Social proof |
| **Featured Brands** | Brand logos | Brand showcase |

### 2.2 Shopping
| Feature | What It Does | Why |
|---------|--------------|-----|
| **Shop** (`/shop`) | Full product grid with filters | Browse all products |
| **Category Pages** | Products by category/subcategory | Organized browsing |
| **Product Detail** | Product info, images, add to cart, reviews | Purchase decision |
| **Search** | Search products by name | Find products quickly |
| **Compare** | Compare products side-by-side | Help decision |
| **Wishlist** | Save products for later | Return visits |

### 2.3 Cart & Checkout
| Feature | What It Does | Why |
|---------|--------------|-----|
| **Cart** | Slide-over + full page at `/cart` | Review before checkout |
| **Checkout** | Shipping form, district/city selection, payment method | Complete purchase |
| **Voucher** | Apply discount codes | Promotions |
| **Delivery Charges** | Inside/Dhaka vs Outside Dhaka | Transparent pricing |
| **Free Delivery** | Threshold-based free delivery | Encourage larger orders |

### 2.4 Payment Methods
| Method | What It Does | Why |
|--------|--------------|-----|
| **COD** | Cash on delivery | Preferred in Bangladesh |
| **bKash** | Mobile wallet | Digital payments |
| **Nagad** | Mobile wallet | Digital payments |
| **Rocket** | Mobile wallet | Digital payments |
| **SSLCommerz** | Card/online payments | Card payments |

**Note:** All payment gateways are enabled/configured from Admin → Payments. No code changes needed.

### 2.5 Order & Account
| Feature | What It Does | Why |
|---------|--------------|-----|
| **Track Order** | Search by order ID or phone | Self-service tracking |
| **OTP Verification** | Optional OTP for order tracking | Privacy protection |
| **Order Complete** | Order confirmation page | Confirmation |
| **My Account** | Login, orders, returns, invoices | Customer self-service |
| **Register / Login** | User registration and login | Returning customers |

### 2.6 Content Pages
| Page | What It Does | Why |
|------|--------------|-----|
| **About Us** | Founder + team profiles | Build trust |
| **Blog** | Blog posts by category | SEO, content marketing |
| **Contact** | Contact form, address, hours | Customer support |
| **Terms & Conditions** | Legal terms | Compliance |
| **Privacy Policy** | Privacy policy | Compliance |
| **Refund / Return Policy** | Policy page | Transparency |

### 2.7 Special Pages
| Page | What It Does | Why |
|------|--------------|-----|
| **Offers** | Offers listing | Promotions |
| **Combo Offers** | Combo offers | Promotions |
| **Landing Pages** | Custom landing pages | Campaigns |

---

## 3. Admin Panel Features (A–Z)

### 3.1 Dashboard
| Feature | What It Does | Why |
|---------|--------------|-----|
| **Dashboard** | Revenue, orders, products, customers, charts | At-a-glance overview |
| **Sales Data** | Revenue and orders over time | Trend analysis |
| **Category Data** | Sales by category | Category performance |
| **Recent Orders** | Latest orders | Quick actions |

### 3.2 Products
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Product List** | `/admin/products` | View, edit, delete products | Manage catalog |
| **Product Upload** | `/admin/products/upload` | Add new products | Add products |
| **Attributes** | `/admin/attributes` | Manage attributes (e.g. Size, Color) | Variable products |
| **Inventory Logs** | `/admin/inventory-logs` | Stock change history | Audit trail |
| **Product RAMS** | `/admin/products/rams` | RAM values for products | Product attributes |
| **Product WEIGHT** | `/admin/products/weights` | Weight values | Product attributes |
| **Product SIZE** | `/admin/products/sizes` | Size values | Product attributes |

### 3.3 Categories
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Categories** | `/admin/categories` | Manage categories, subcategories | Organize catalog |

### 3.4 Orders
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Orders** | `/admin/orders` | View, update status, manage orders | Order fulfillment |
| **Order Create** | `/admin/orders/create` | Create order manually | Phone/offline orders |
| **Order Activities** | `/admin/orders/activities` | Order activity log | Audit |

### 3.5 Banners & Homepage
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Home Banner Slides** | `/admin/home-banner-slides` | Hero slider images | Homepage hero |
| **Home Banners** | `/admin/home-banners` | Main banners | Homepage banners |
| **Home Side Banners** | `/admin/home-side-banners` | Side banners | Homepage layout |
| **Home Bottom Banners** | `/admin/home-bottom-banners` | Bottom banners | Homepage layout |
| **Homepage Builder** | `/admin/settings/homepage` | Sections, blocks, featured products | Customize homepage |

### 3.6 Promotions
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Flash Sale** | `/admin/flash-sale` | Time-limited discounts | Urgency |
| **Vouchers** | `/admin/vouchers` | Discount codes | Promotions |

### 3.7 Settings & Configuration
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Store Settings** | `/admin/settings` | Logo, name, address, phone, email, delivery charges, theme colors, SEO | Store identity |
| **Tracking & Pixels** | `/admin/settings/tracking` | Facebook Pixel, CAPI, GTM, GA4, TikTok Pixel | Ads tracking |
| **Security** | `/admin/settings/security` | Change admin password | Admin security |
| **Integrations** | `/admin/settings/integrations` | Courier API credentials (Pathao, Steadfast, RedX) | Courier booking |
| **Checkout Settings** | `/admin/checkout-settings` | Checkout flow options | Checkout config |
| **Payments** | `/admin/payments` | Enable/disable gateways, configure credentials | Payment config |

### 3.8 Analytics & Reports
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Analytics** | `/admin/analytics` | Events, export CSV | Conversion tracking |
| **Live Visitors** | `/admin/analytics/live` | Real-time visitors | Live traffic |
| **Order Report** | `/admin/reports/orders` | Order reports | Sales analysis |
| **Expense** | `/admin/reports/expense` | Expense tracking | Profitability |

### 3.9 Content & Pages
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Blog** | `/admin/blog` | Blog posts | Content |
| **Blog Categories** | `/admin/blog-categories` | Blog categories | Organize blog |
| **Site Pages** | `/admin/pages` | CMS pages | Site content |
| **Legal Pages** | `/admin/legal-pages` | Terms, privacy, refund | Legal |
| **About** | `/admin/about` | About page content | About us |
| **Menus** | `/admin/menus` | Navigation menus | Site structure |

### 3.10 Customers
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Customers** | `/admin/customers` | Customer list | CRM |
| **Repeat Customer** | `/admin/customers/repeat` | Repeat customers | Loyalty |
| **Customer Risk** | `/admin/customers/risk` | Risk scores | Fraud prevention |

### 3.11 Marketing & Sales
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Reminders** | `/admin/reminders` | Reminder campaigns | Re-engagement |
| **Abandoned Checkout** | `/admin/draft-orders` | Draft orders | Abandoned cart recovery |
| **Landing Pages** | `/admin/landing-pages` | Custom landing pages | Campaigns |
| **Ad Management** | `/admin/ad-management` | Ad campaigns | Campaign management |
| **Product Catalogs** | `/admin/collections` | Product collections | Collections |

### 3.12 Operations
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Product Filters** | `/admin/product-filters` | Storefront filters | Filter config |
| **Units** | `/admin/products/units` | Product units | Units |
| **Shipping** | `/admin/shipping` | Shipping rules | Shipping config |
| **Courier** | `/admin/courier` | Courier booking | Delivery |
| **Message Inbox** | `/admin/messages` | Customer messages | Support |

### 3.13 Security & Fraud
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **Fraud & Security** | `/admin/fraud` | Fraud policies, flags, blocked IPs | Fraud prevention |

### 3.14 System & Support
| Feature | Path | What It Does | Why |
|---------|------|--------------|-----|
| **System Health** | `/admin/system-health` | Health checks | Monitoring |
| **Event Debug** | `/admin/event-debug` | Analytics, notifications, webhooks debug | Troubleshooting |
| **Notifications** | `/admin/notifications` | Notification settings | Alerts |
| **Team** | `/admin/team` | Team members | Admin users |

---

## 4. Integrations & APIs

### 4.1 Payment Gateways
| Gateway | Purpose | Admin Config |
|---------|---------|--------------|
| **COD** | Cash on delivery | Enable/disable |
| **bKash** | Mobile wallet | Credentials in Admin → Payments |
| **Nagad** | Mobile wallet | Credentials in Admin → Payments |
| **Rocket** | Mobile wallet | Credentials in Admin → Payments |
| **SSLCommerz** | Card/online | Store ID, password, sandbox/live |

### 4.2 Courier
| Provider | Purpose | Admin Config |
|----------|---------|--------------|
| **Pathao** | Courier booking | Admin → Integrations (SecureConfig) |
| **Steadfast** | Courier booking | Admin → Integrations |
| **RedX** | Courier booking | Admin → Integrations |

**Note:** Courier credentials are stored encrypted (SecureConfig). Admin can set them without code changes.

### 4.3 Tracking & Pixels (Admin-Configured)
| Integration | Purpose | Admin Config |
|-------------|---------|--------------|
| **Facebook Pixel** | Meta Ads tracking | Admin → Tracking & Pixels |
| **Facebook CAPI** | Server-side conversion events | Admin → Tracking & Pixels |
| **Google Tag Manager** | GTM container | Admin → Tracking & Pixels |
| **Google Analytics 4** | GA4 | Admin → Tracking & Pixels |
| **TikTok Pixel** | TikTok Ads | Admin → Tracking & Pixels |

**All tracking IDs are managed from Admin → Settings → Tracking & Pixels. No env vars needed.**

---

## 5. What Can Be Done (Summary)

### For Store Owner
- Manage products, categories, prices, stock
- Process orders, update status, print labels
- Enable/disable payment methods and configure credentials
- Set delivery charges, free delivery threshold
- Create vouchers and flash sales
- Manage homepage banners and sections
- Configure tracking pixels (FB, CAPI, GTM, GA4, TikTok) from admin
- View analytics and reports
- Manage customers and customer notes
- Configure courier (Pathao, Steadfast, RedX) from admin
- Change admin password
- Manage blog, legal pages, about page

### For Customers
- Browse products, search, filter
- Add to cart, compare, wishlist
- Checkout with multiple payment options
- Track order by ID or phone (with optional OTP)
- Create account, view orders, returns
- Read blog, contact, about

### For Developers
- Multi-tenant architecture (ready for multiple stores)
- PostgreSQL + Prisma
- REST APIs for admin and storefront
- Webhook support (SSLCommerz, etc.)
- Audit logs for sensitive actions

---

## 6. Feature Status & Notes

| Area | Status | Notes |
|------|--------|-------|
| **Products** | ✅ Full | Attributes CRUD; variant system in schema |
| **Orders** | ✅ Full | Status workflow, tags, notes |
| **Payments** | ✅ Full | Admin UI for all gateways |
| **Tracking & Pixels** | ✅ Full | Admin UI for FB, CAPI, GTM, GA4, TikTok |
| **Courier** | ✅ Full | Admin credentials; booking API |
| **Analytics** | ✅ Full | Events, live visitors |
| **Variable Products** | ⚠️ Partial | Schema ready; variant UI in product form pending |

---

## 7. Deployment

- **Database:** PostgreSQL
- **Storage:** Local uploads (configurable `UPLOAD_DIR` for CloudPanel)
- **Deploy:** See `CLOUDPANEL_DEPLOY.md` for deployment steps

---

*Document generated for client handover. Last updated: March 2026.*
