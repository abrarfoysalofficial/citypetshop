# 🚀 Core E-Commerce Setup Plan (Like JUST PET BD, Skip Loyalty)

**Project Template:** Streamlined e-commerce for pet shops, general retail  
**Stack:** Next.js 14 App Router, TypeScript, Tailwind, PostgreSQL, Prisma  
**Timeline:** 12–16 weeks  
**Status:** Plan only (ready to execute)

---

## 📋 OVERVIEW

This plan builds a **production-grade e-commerce admin panel** (similar to JUST PET BD's structure) but **excludes:**
- ❌ Membership programs
- ❌ Reward points
- ❌ Landing page builder
- ❌ Refund workflow (Phase 1, can add later)
- ❌ Advanced SEO management hub

**Includes:**
- ✅ Products, categories, brands, attributes
- ✅ Inventory & stock management
- ✅ Orders & order management
- ✅ Customers
- ✅ Marketing (coupons, flash sales, announcements)
- ✅ CMS (pages, blog, banners, homepage builder)
- ✅ Reviews moderation
- ✅ Reports & analytics
- ✅ Media management (image library)
- ✅ Settings & configuration
- ✅ Audit logs
- ✅ RBAC (admin roles & permissions)

---

## 🗂️ ADMIN ROUTE MAP (FINAL)

```
/admin
├── /login                          [Auth]
├── /
│   ├── Dashboard
│   ├── Reports
│   │   └── /coupons, /flash-sales
│   │
│   ├── Orders                       [OMS]
│   ├── Customers                    [CRM]
│   │
│   ├── Products                     [PIM]
│   ├── Categories                   [Parent Categories]
│   │   ├── /new
│   │   ├── /[id]/edit
│   │   └── /[id]/subcategories      [Subcategories]
│   │       ├── /new
│   │       ├── /[subId]/edit
│   │       └── /[subId]/delete
│   ├── Brands
│   ├── Attributes
│   ├── Inventory
│   ├── Media
│   │
│   ├── Reviews
│   │
│   ├── Marketing
│   │   ├── /coupons
│   │   ├── /flash-sales
│   │   └── /announcements
│   │
│   ├── CMS
│   │   ├── /homepage
│   │   ├── /pages
│   │   ├── /blog
│   │   ├── /banners
│   │   └── /redirects
│   │
│   └── Settings
        ├── Store settings
        ├── Theme
        ├── Env config
        ├── Users & roles
        └── Integrations (Courier, Payment)
```

---

## 🏗️ CATEGORY → SUBCATEGORY → PRODUCT HIERARCHY

### Visual Hierarchy Structure

```
Main Category (Parent)
│
├─── Subcategory 1
│    ├─ Product A
│    ├─ Product B
│    └─ Product C
│
├─── Subcategory 2
│    ├─ Product D
│    ├─ Product E
│    └─ Product F
│
└─── Subcategory 3
     ├─ Product G
     └─ Product H
```

### Real-World Example: Pet Shop

```
🐕 DOG CARE (Main Category)
│
├─── Dog Food (Subcategory)
│    ├─ Royal Canin Adult Dog Food
│    ├─ Pedigree Dry Dog Food
│    ├─ Purina Pro Plan
│    └─ Iams Adult Dog Food
│
├─── Dog Toys (Subcategory)
│    ├─ Ball Toy Set
│    ├─ Rope Chew Toy
│    ├─ Interactive Puzzle Toy
│    └─ Squeaky Duck Toy
│
└─── Dog Grooming (Subcategory)
     ├─ Dog Shampoo
     ├─ Dog Brush Set
     ├─ Nail Clipper
     └─ Dog Cologne

🐱 CAT CARE (Main Category)
│
├─── Cat Food (Subcategory)
│    ├─ Fancy Feast Wet Cat Food
│    ├─ Friskies Dry Cat Food
│    ├─ Sheba Cat Food
│    └─ Science Diet Cat Food
│
├─── Cat Toys (Subcategory)
│    ├─ Feather Wand Toy
│    ├─ Ball with Bell
│    ├─ Laser Pointer
│    └─ Catnip Mouse
│
└─── Cat Litter (Subcategory)
     ├─ Clumping Cat Litter
     ├─ Silica Gel Cat Litter
     ├─ Biodegradable Cat Litter
     └─ Odor Control Cat Litter
```

### Database Relations

```
┌─────────────────────────────────────────┐
│         CATEGORY (Main)                 │
│  id: "1", name: "Dog Care",             │
│  slug: "dog-care", parentId: null       │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐
│SUBCATEGORY 1│ │SUBCAT 2  │ │ SUBCAT 3   │
│id: "1a"     │ │id: "1b"  │ │ id: "1c"   │
│Dog Food     │ │Dog Toys  │ │Dog Grooming│
│parentId: "1"│ │parentId..│ │parentId: "1│
└──────┬──────┘ └────┬─────┘ └────┬───────┘
       │             │             │
   ┌───┴───┐    ┌────┴────┐   ┌───┴────┐
   ▼   ▼   ▼    ▼    ▼    ▼   ▼   ▼    ▼
[PROD][PROD][PROD][PROD][PROD][PROD][PROD]
```

### Prisma Relations

```typescript
// Product → Subcategory (many-to-many via ProductCategory)
model Product {
  id String @id @default(cuid())
  name String
  categories ProductCategory[] // Can belong to multiple subcategories
  // ...
}

model ProductCategory {
  productId String
  categoryId String // Can be main or subcategory
  product Product @relation(fields: [productId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
  @@id([productId, categoryId])
}

// Category (with hierarchy)
model Category {
  id String @id @default(cuid())
  name String
  slug String @unique
  parentId String? // null = main category, "1" = subcategory of main
  parent Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy") // If it's a main category
  products ProductCategory[]
}
```

---

## 💾 SUBCATEGORY MANAGEMENT GUIDE

### Database Queries (Prisma)

```typescript
// Get all parent categories (no parent)
const parentCategories = await prisma.category.findMany({
  where: { parentId: null },
  include: { children: true }, // Include subcategories
  orderBy: [{ order: 'asc' }, { name: 'asc' }],
});

// Get all subcategories for a parent
const subcategories = await prisma.category.findMany({
  where: { parentId: parentCategoryId },
  orderBy: [{ order: 'asc' }, { name: 'asc' }],
});

// Get full category hierarchy
const hierarchy = await prisma.category.findMany({
  where: { parentId: null }, // Only parents
  include: {
    children: {
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    },
  },
  orderBy: [{ order: 'asc' }, { name: 'asc' }],
});

// Find a category (parent or subcategory) by slug
const category = await prisma.category.findUnique({
  where: { slug: categorySlug },
  include: { parent: true, children: true },
});

// Get all products in a category + its subcategories (recursive)
const filterByCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  // Get this category + all descendants
  const categoryIds = [categoryId];
  const addDescendants = async (parentId: string) => {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    });
    for (const child of children) {
      categoryIds.push(child.id);
      await addDescendants(child.id); // Recursive
    }
  };
  await addDescendants(categoryId);

  // Get all products in these categories
  const products = await prisma.product.findMany({
    where: {
      categories: {
        some: { categoryId: { in: categoryIds } },
      },
    },
  });
  return products;
};
```

### Storefront Mega Menu (React Component Example)

```typescript
// components/Navbar.tsx
const categories = await getParentCategories(); // Fetch parent + children

export function MegaMenu() {
  return (
    <div className="mega-menu">
      {categories.map((parent) => (
        <div key={parent.id} className="menu-group">
          <a href={`/shop?category=${parent.slug}`} className="parent-link">
            {parent.name}
          </a>
          {parent.children.length > 0 && (
            <div className="submenu">
              {parent.children.map((sub) => (
                <a
                  key={sub.id}
                  href={`/shop?category=${parent.slug}&subcategory=${sub.slug}`}
                  className="sub-link"
                >
                  {sub.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Storefront Mega Menu (React Component Example)

```typescript
// components/Navbar.tsx
const categories = await getParentCategories(); // Fetch parent + children

export function MegaMenu() {
  return (
    <div className="mega-menu">
      {categories.map((parent) => (
        <div key={parent.id} className="menu-group">
          <a href={`/shop?category=${parent.slug}`} className="parent-link font-bold">
            {parent.name}
          </a>
          {parent.children.length > 0 && (
            <div className="submenu grid grid-cols-3 gap-4">
              {parent.children.map((sub) => (
                <div key={sub.id} className="subcategory-column">
                  <a
                    href={`/shop?category=${parent.slug}&subcategory=${sub.slug}`}
                    className="sub-link font-semibold text-blue-600 hover:underline"
                  >
                    {sub.name}
                  </a>
                  {/* Optional: Show featured products from this subcategory */}
                  <ul className="mt-2 text-sm text-gray-600">
                    {sub.featuredProducts?.map((prod) => (
                      <li key={prod.id}>
                        <a href={`/product/${prod.slug}`} className="hover:text-blue-600">
                          {prod.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Shop Page Filtering

```typescript
// app/shop/page.tsx
export default async function ShopPage({
  searchParams,
}: {
  searchParams: { 
    category?: string; 
    subcategory?: string;
    [key: string]: string | undefined;
  };
}) {
  const categorySlug = searchParams.category;
  const subcategorySlug = searchParams.subcategory;

  // Build query
  let whereCondition: any = {};

  if (subcategorySlug) {
    // Filtering by subcategory
    const subcategory = await prisma.category.findUnique({
      where: { slug: subcategorySlug },
    });
    if (subcategory) {
      whereCondition.categories = {
        some: { categoryId: subcategory.id },
      };
    }
  } else if (categorySlug) {
    // Filtering by main category (include all subcategories)
    const mainCategory = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: { children: true },
    });
    if (mainCategory) {
      const categoryIds = [
        mainCategory.id,
        ...mainCategory.children.map((c) => c.id),
      ];
      whereCondition.categories = {
        some: { categoryId: { in: categoryIds } },
      };
    }
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    include: { categories: { include: { category: true } } },
  });

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Home</a>
        {mainCategory && (
          <a href={`/shop?category=${mainCategory.slug}`}>{mainCategory.name}</a>
        )}
        {subcategorySlug && (
          <span>{subcategorySlug}</span>
        )}
      </nav>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Product Page Breadcrumb

```typescript
// Product page breadcrumb
// Path: Home > Main Category > Subcategory > Product

export function ProductBreadcrumb({ product }) {
  const [mainCategory, subcategory] = getProductCategoryHierarchy(product);

  return (
    <nav className="breadcrumb text-sm text-gray-600">
      <a href="/" className="hover:text-blue-600">Home</a>
      <span> / </span>
      {mainCategory && (
        <>
          <a href={`/shop?category=${mainCategory.slug}`} className="hover:text-blue-600">
            {mainCategory.name}
          </a>
          <span> / </span>
        </>
      )}
      {subcategory && (
        <>
          <a 
            href={`/shop?category=${mainCategory.slug}&subcategory=${subcategory.slug}`}
            className="hover:text-blue-600"
          >
            {subcategory.name}
          </a>
          <span> / </span>
        </>
      )}
      <span className="text-gray-900 font-semibold">{product.name}</span>
    </nav>
  );
}
```

### Admin Routes Structure

```
/admin/categories
├── List parent categories
│   └── Click on parent → expand to show subcategories
│       └── Click on subcategory → edit/delete options

/admin/categories/new
└── Create new main category (parentId = null)

/admin/categories/[parentId]/edit
└── Edit main category

/admin/categories/[parentId]/subcategories
├── List all subcategories for this parent
└── Bulk actions on subcategories

/admin/categories/[parentId]/subcategories/new
└── Create new subcategory (parentId = this parent's id)

/admin/categories/[parentId]/subcategories/[subId]/edit
└── Edit subcategory (can optionally move to different parent)

/admin/categories/[parentId]/subcategories/[subId]/delete
└── Delete subcategory (cascade or prevent if has products)
```

### Validation Schemas (Zod)

```typescript
// packages/validation/category.ts

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(), // If creating subcategory
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const subcategoryCreateSchema = z.object({
  parentId: z.string().min(1), // Required for subcategory
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().url().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const subcategoryUpdateSchema = subcategoryCreateSchema.omit({ parentId: true }).partial();
```

---

## 💾 PRISMA SCHEMA (REQUIRED MODELS)

### Core
- `User` — Admin users
- `Role`, `Permission`, `RolePermission`, `UserRole` — RBAC
- `AuditLog` — All admin actions

### Catalog
- `Category` — With parent hierarchy
- `Brand`
- `Product` — Main product
- `ProductImage` — CDN URLs (Cloudinary, AWS S3, etc.)
- `ProductVariant` — SKU, price, stock
- `ProductCategory` — Junction (product can have multiple categories)
- `Attribute` — Like "Size", "Color"
- `ProductAttribute`, `ProductAttributeValue`, `ProductVariantAttribute`
- `ProductReview` — With moderation status

### Orders & Customers
- `Customer` — Email, phone, loyalty tier (but NO membership program)
- `Address` — Billing & shipping
- `Order` — Order header
- `OrderItem` — Line items
- `OrderStatusHistory` — Audit trail
- `PaymentTransaction` — Payment records

### Marketing
- `Coupon`, `CouponRedemption`
- `FlashSale`, `FlashSaleItem`
- `Announcement`
- `AbandonedCartLead` (optional, for email recovery)

### CMS
- `Page` — Static pages
- `BlogPost`, `BlogCategory`, `BlogComment`
- `Banner` — Hero, featured banners
- `HomepageSection`, `HomepageSectionItem`
- `RedirectRule` — URL redirects for old pages

### Settings
- `Settings` — Key-value store
- `MediaAsset` — File metadata (name, URL, size, type)

### Optional (Phase 2+)
- `Cart`, `CartItem` — Storefront cart (separate from admin)
- `Wishlist`
- `SmsLog`, `EmailLog` — Notification audit

---

## 📅 PHASE BREAKDOWN

### PHASE 0: Project Init & Audit ✅
**Duration:** 1–2 weeks  
**Tasks:**
- [x] Create monorepo (Turborepo or standalone)
- [x] Configure Next.js 14 + TypeScript + Tailwind
- [x] Set up PostgreSQL + Prisma
- [x] NextAuth setup (Credentials provider)
- [x] Create base Prisma schema (models above)
- [x] Create 8 migrations
- [x] Set up GitHub Actions for CI/CD
- [x] Document architecture (like JUST PET BD)

**Deliverables:**
- `docs/ARCHITECTURE.md`
- Starter schema in `prisma/schema.prisma`
- 8 migrations: init, roles, audit, coupon, flashsale, announcements, indexes, cms
- GitHub Actions workflow (.github/workflows/ci.yml)
- README with setup instructions

**Blast Radius:** Foundation only; no features yet.

---

### PHASE 1: Admin Navigation & Layout ✅
**Duration:** 3–5 days  
**Tasks:**
- [ ] Create admin sidebar with grouped navigation (see nav map above)
- [ ] Set up admin layout (header + sidebar + main)
- [ ] Add breadcrumb component (reusable)
- [ ] Create PageHero component (consistent headers)
- [ ] Admin middleware (RBAC check)
- [ ] 404 page for unimplemented routes

**Files:**
- `app/admin/(dashboard)/layout.tsx`
- `app/admin/(dashboard)/admin-sidebar.tsx`
- `components/admin/breadcrumb.tsx`
- `components/layout/page-hero.tsx`
- `lib/admin-auth.ts` (already done for citypetshop.bd)

**Blast Radius:** Layout only; no data changes.

---

### PHASE 2: Dashboard & KPIs 📊
**Duration:** 1 week  
**Tasks:**
- [ ] Dashboard page with KPI cards (sales, orders, customers, products)
- [ ] Charts (revenue over time, top products, top categories)
- [ ] Recent orders widget
- [ ] Quick stats (out-of-stock count, pending orders, etc.)
- [ ] Date range selector for filtering

**APIs:**
- `GET /api/admin/dashboard/stats` — KPIs
- `GET /api/admin/dashboard/revenue` — Revenue chart data
- `GET /api/admin/dashboard/orders` — Recent orders

**Components:**
- `app/admin/(dashboard)/components/stats-cards.tsx`
- `app/admin/(dashboard)/components/revenue-chart.tsx`
- `app/admin/(dashboard)/components/recent-orders.tsx`
- `app/admin/(dashboard)/page.tsx`

---

### PHASE 3: Products (PIM) 🏷️
**Duration:** 2–3 weeks  
**Tasks:**
- [ ] Product list page (table, filters: status, category, brand, price range)
- [ ] Product create form (name, desc, SKU, images, meta)
- [ ] Product edit form
- [ ] Product delete (soft/hard)
- [ ] Bulk actions (change status, set price, add to category)
- [ ] Image upload (Cloudinary integration)
- [ ] SEO fields (meta title, desc, slug)
- [ ] Product search (Prisma fulltext or Algolia)

**Models:** Product, ProductImage, ProductCategory

**Validation Schemas:**
- `productCreateSchema`
- `productUpdateSchema`

**Server Actions:**
- `createProduct(data)`
- `updateProduct(id, data)`
- `deleteProduct(id)`
- `uploadProductImage(productId, file)`
- `reorderProductImages(productId, imageIds)`

**Pages:**
- `app/admin/products/page.tsx` — List
- `app/admin/products/new/page.tsx` — Create
- `app/admin/products/[id]/page.tsx` — Edit view
- `app/admin/products/[id]/edit/page.tsx` — Edit form (or single component)

**APIs:**
- `GET /api/admin/products` — List with filters
- `POST /api/admin/products` — Create
- `PATCH /api/admin/products/[id]` — Update
- `DELETE /api/admin/products/[id]` — Delete
- `POST /api/admin/products/[id]/images` — Upload image

---

### PHASE 4: Categories, Brands, Attributes & Subcategories 🏗️
**Duration:** 1–2 weeks  
**Tasks:**
- [ ] Category list page with parent categories only
- [ ] Create parent category
- [ ] Edit parent category
- [ ] Delete parent category (cascade to subcategories or prevent if has children)
- [ ] Subcategory list nested under parent category (`/categories/[parentId]/subcategories`)
- [ ] Create subcategory linked to parent
- [ ] Edit subcategory
- [ ] Delete subcategory
- [ ] Move subcategory between parents (drag-and-drop or select field)
- [ ] Category hierarchy visualization (tree view or nested list)
- [ ] Brand list, create, edit, delete
- [ ] Attribute list, create, edit, delete (with values: Size, Color, RAM, etc.)
- [ ] Link attributes to categories
- [ ] Reusable forms (category-form, subcategory-form, brand-form, attribute-form)

**Category Hierarchy Examples:**
```
Food (Parent)
├── Dog Food (Subcategory)
├── Cat Food (Subcategory)
└── Bird Food (Subcategory)

Toys (Parent)
├── Ball Toys (Subcategory)
├── Rope Toys (Subcategory)
└── Interactive Toys (Subcategory)

Grooming (Parent)
├── Shampoos (Subcategory)
├── Brush & Combs (Subcategory)
└── Nail Care (Subcategory)
```

**Models:** Category (with `parentId`), Brand, Attribute, ProductAttribute, ProductAttributeValue

**Pages:**
- `app/admin/categories/page.tsx` — Parent categories list
- `app/admin/categories/new/page.tsx` — Create parent category
- `app/admin/categories/[id]/edit/page.tsx` — Edit parent category
- `app/admin/categories/[parentId]/subcategories/page.tsx` — List subcategories
- `app/admin/categories/[parentId]/subcategories/new/page.tsx` — Create subcategory
- `app/admin/categories/[parentId]/subcategories/[subId]/edit/page.tsx` — Edit subcategory
- Similar for brands and attributes

**API Routes:**
- `GET /api/admin/categories` — List parent categories
- `POST /api/admin/categories` — Create parent category
- `PATCH /api/admin/categories/[id]` — Update parent category
- `DELETE /api/admin/categories/[id]` — Delete parent category
- `GET /api/admin/categories/[parentId]/subcategories` — List subcategories
- `POST /api/admin/categories/[parentId]/subcategories` — Create subcategory
- `PATCH /api/admin/categories/[parentId]/subcategories/[subId]` — Update subcategory
- `DELETE /api/admin/categories/[parentId]/subcategories/[subId]` — Delete subcategory

**Storefront Integration:**
- Navbar mega menu shows parent categories
- Hover/click parent category shows subcategories
- `/shop?category=parentSlug` filters by parent
- `/shop?category=parentSlug&subcategory=subSlug` filters by subcategory
- `/product/[slug]` shows breadcrumb: Category > Subcategory > Product

---

### PHASE 5: Inventory Management 📦
**Duration:** 1 week  
**Tasks:**
- [ ] Inventory list (SKU, quantity, reorder level, status)
- [ ] Update stock inline or via form
- [ ] Bulk stock set (CSV upload or inline grid)
- [ ] Stock movement history (audit log)
- [ ] Low stock alerts

**Models:** ProductVariant (has quantity), InventoryLog (audit trail)

**Pages:**
- `app/admin/inventory/page.tsx` — Grid/table view
- Inline edit or modal form for stock updates

**APIs:**
- `GET /api/admin/inventory` — List
- `PATCH /api/admin/inventory/[variantId]` — Update stock
- `POST /api/admin/inventory/bulk-update` — CSV or array update

---

### PHASE 6: Orders & OMS 📋
**Duration:** 2 weeks  
**Tasks:**
- [ ] Order list (filters: status, date, customer, payment method)
- [ ] Order detail page (items, customer, shipping, payment, timeline)
- [ ] Update order status (with status history)
- [ ] Manual order creation (admin-only, for phone orders)
- [ ] Courier integration (Steadfast, Pathao, etc.)
- [ ] Book courier, generate tracking link
- [ ] Print invoice
- [ ] Email customer

**Models:** Order, OrderItem, OrderStatusHistory, PaymentTransaction, Coupon (redemption)

**Pages:**
- `app/admin/orders/page.tsx` — List
- `app/admin/orders/new/page.tsx` — Create
- `app/admin/orders/[id]/page.tsx` — Detail

**APIs:**
- `GET /api/admin/orders`
- `POST /api/admin/orders`
- `GET /api/admin/orders/[id]`
- `PATCH /api/admin/orders/[id]` — Update status
- `POST /api/admin/orders/[id]/courier` — Book courier
- `POST /api/admin/orders/[id]/invoice` — Generate PDF

---

### PHASE 7: Customers & CRM 👥
**Duration:** 1 week  
**Tasks:**
- [ ] Customer list (search, filters: registration date, total spent, status)
- [ ] Customer detail page (info, orders, addresses, activity)
- [ ] Customer notes (admin only)
- [ ] Disable customer account
- [ ] Export customer list (CSV)

**Models:** Customer, Address, Order

**Pages:**
- `app/admin/customers/page.tsx` — List
- `app/admin/customers/[id]/page.tsx` — Detail

**APIs:**
- `GET /api/admin/customers`
- `GET /api/admin/customers/[id]`
- `PATCH /api/admin/customers/[id]` — Update notes, disable

---

### PHASE 8: Reviews Moderation ⭐
**Duration:** 3–5 days  
**Tasks:**
- [ ] Review list (filters: status, product, rating, date)
- [ ] Approve/reject review
- [ ] Reply to review (admin response)
- [ ] Delete review
- [ ] Bulk actions (approve all, reject spam)

**Models:** ProductReview

**Pages:**
- `app/admin/reviews/page.tsx`

**APIs:**
- `GET /api/admin/reviews`
- `PATCH /api/admin/reviews/[id]` — Approve/reject/update

---

### PHASE 9: Marketing (Coupons, Flash Sales, Announcements) 📢
**Duration:** 2 weeks  
**Tasks:**

#### Coupons
- [ ] Coupon list, create, edit, delete
- [ ] Coupon types: fixed, percentage, BOGO, free shipping
- [ ] Redemption limit, usage count tracking
- [ ] Valid date range
- [ ] Applicable categories/products/min spend

#### Flash Sales
- [ ] Flash sale list, create, edit, delete
- [ ] Time-limited (start/end datetime)
- [ ] Featured deal badge
- [ ] Add products to flash sale
- [ ] Discount per product or % off

#### Announcements
- [ ] Announcement list (banners, popups, email)
- [ ] Create/edit/publish/schedule
- [ ] Target audience (all customers, new customers, etc.)

**Models:** Coupon, CouponRedemption, FlashSale, FlashSaleItem, Announcement

**Pages:**
- `app/admin/marketing/page.tsx` — Hub
- `app/admin/marketing/coupons/page.tsx`
- `app/admin/marketing/coupons/new/page.tsx`
- `app/admin/marketing/coupons/[id]/edit/page.tsx`
- Similar for flash-sales and announcements

---

### PHASE 10: CMS (Homepage, Pages, Blog, Banners) 📝
**Duration:** 2–3 weeks  
**Tasks:**

#### Homepage Builder
- [ ] Drag-and-drop sections (hero, featured products, categories, testimonials, etc.)
- [ ] Section settings (background, text color, alignment)
- [ ] Hero slider with images
- [ ] Featured products section
- [ ] Category showcase
- [ ] Testimonials/reviews section

#### Static Pages
- [ ] Create/edit/delete pages (About, Contact, Support, etc.)
- [ ] WYSIWYG editor or Markdown
- [ ] Meta tags and SEO fields

#### Blog
- [ ] Blog post list, create, edit, delete
- [ ] Blog categories
- [ ] Featured image
- [ ] Publishing workflow (draft, published, scheduled)
- [ ] Categories, tags
- [ ] Comments moderation

#### Banners
- [ ] Banner list, create, edit, delete
- [ ] Multiple banner slots (hero, sidebar, footer)
- [ ] Desktop/mobile URLs
- [ ] Active/inactive toggle
- [ ] Schedule banner display

#### URL Redirects
- [ ] Create redirect rules (old URL → new URL)
- [ ] 301 (permanent) vs 302 (temporary)

**Models:** HomepageSection, HomepageSectionItem, Page, BlogPost, BlogCategory, Banner, RedirectRule

**Pages:**
- `app/admin/cms/page.tsx` — Hub
- `app/admin/cms/homepage/page.tsx`
- `app/admin/cms/pages/page.tsx`
- `app/admin/cms/blog/page.tsx`
- `app/admin/cms/banners/page.tsx`
- `app/admin/cms/redirects/page.tsx`

---

### PHASE 11: Media Library 🖼️
**Duration:** 1 week  
**Tasks:**
- [ ] Upload images, documents (Cloudinary or AWS S3)
- [ ] File browser (grid view)
- [ ] Delete, bulk upload
- [ ] Search by filename/tag
- [ ] CDN integration (generate optimized URLs for different sizes)

**Models:** MediaAsset

**Pages:**
- `app/admin/media/page.tsx` — File browser
- Modal for image picker (reusable in product form, banner form, etc.)

---

### PHASE 12: Settings & Configuration ⚙️
**Duration:** 1 week  
**Tasks:**
- [ ] Store settings (name, logo, address, contact info, hours)
- [ ] Theme colors, branding
- [ ] Payment gateway config (SSLCommerz, COD, etc.)
- [ ] Courier integration (API keys, test mode)
- [ ] Email settings (SMTP, templates)
- [ ] SMS settings (Twilio, BulkSMS, etc.)
- [ ] Admin user management (create, edit, delete, roles)
- [ ] Env config display (read-only for prod secrets)
- [ ] Legal pages settings (links to terms, privacy, etc.)

**Pages:**
- `app/admin/settings/page.tsx` — Main settings
- `app/admin/settings/users/page.tsx` — User management
- `app/admin/settings/integrations/page.tsx` — API keys
- `app/admin/settings/theme/page.tsx` — Theme colors

---

### PHASE 13: Reports & Analytics 📊
**Duration:** 1–2 weeks  
**Tasks:**
- [ ] Sales report (revenue, order count by date)
- [ ] Coupon usage report
- [ ] Flash sale performance
- [ ] Top products (by sales, views)
- [ ] Customer demographics
- [ ] Date range picker
- [ ] Export to CSV/PDF

**Pages:**
- `app/admin/reports/page.tsx` — Hub
- `app/admin/reports/sales/page.tsx`
- `app/admin/reports/coupons/page.tsx`
- `app/admin/reports/flash-sales/page.tsx`
- `app/admin/reports/products/page.tsx`

**APIs:**
- `GET /api/admin/reports/sales` — Revenue data
- `GET /api/admin/reports/top-products` — Best sellers
- `GET /api/admin/reports/coupon-usage` — Coupon analytics

---

### PHASE 14: RBAC & Audit Logs 🔐
**Duration:** 1 week  
**Tasks:**
- [ ] Define roles: Admin (full access), Editor (products, orders), Viewer (read-only)
- [ ] Role-based middleware checks
- [ ] Audit log table: who, what, when
- [ ] Audit log viewer (admin only)
- [ ] Permission matrix documentation

**Models:** Role, Permission, RolePermission, UserRole, AuditLog

**Pages:**
- `app/admin/settings/users/[id]/roles/page.tsx` — Assign roles

---

## 🗄️ DATABASE SCHEMA (ABBREVIATED)

```prisma
// Auth & RBAC
model User {
  id String @id @default(cuid())
  email String @unique
  password String
  name String
  roles UserRole[]
  auditLogs AuditLog[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Role {
  id String @id @default(cuid())
  name String @unique ("admin", "editor", "viewer")
  permissions RolePermission[]
  users UserRole[]
}

model Permission {
  id String @id @default(cuid())
  name String @unique ("product.view", "product.edit", "order.view", etc.)
  roles RolePermission[]
}

model RolePermission {
  roleId String
  permissionId String
  role Role @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model UserRole {
  userId String
  roleId String
  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}

model AuditLog {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id])
  action String ("create", "update", "delete")
  model String ("Product", "Order", "Customer", etc.)
  recordId String
  changes Json
  ipAddress String?
  createdAt DateTime @default(now())
}

// Catalog
model Category {
  id String @id @default(cuid())
  name String
  slug String @unique
  description String?
  image String?
  
  // Hierarchy: parentId = null for top-level categories
  // parentId = categoryId for subcategories
  parentId String?
  parent Category? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children Category[] @relation("CategoryHierarchy") // All direct children (subcategories)
  
  products ProductCategory[]
  attributes ProductAttribute[]
  
  // SEO
  metaTitle String?
  metaDescription String?
  
  // Display
  order Int @default(0) // For sorting in lists
  isActive Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([parentId]) // Speed up hierarchy queries
}

model Brand {
  id String @id @default(cuid())
  name String @unique
  logo String?
  products Product[]
}

model Product {
  id String @id @default(cuid())
  name String
  slug String @unique
  description String?
  sku String @unique
  price Float
  cost Float?
  images ProductImage[]
  categories ProductCategory[]
  brand Brand? @relation(fields: [brandId], references: [id])
  brandId String?
  attributes ProductAttribute[]
  variants ProductVariant[]
  reviews ProductReview[]
  seoTitle String?
  seoDesc String?
  status String @default("draft") // "draft", "active", "inactive"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ProductImage {
  id String @id @default(cuid())
  productId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url String
  alt String?
  order Int @default(0)
  isPrimary Boolean @default(false)
}

model ProductCategory {
  productId String
  categoryId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])
  @@id([productId, categoryId])
}

model ProductVariant {
  id String @id @default(cuid())
  productId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku String @unique
  price Float?
  stock Int @default(0)
  attributes ProductVariantAttribute[]
}

model Attribute {
  id String @id @default(cuid())
  name String ("Size", "Color", "RAM", etc.)
  productAttributes ProductAttribute[]
}

model ProductAttribute {
  id String @id @default(cuid())
  productId String
  attributeId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  attribute Attribute @relation(fields: [attributeId], references: [id])
  values ProductAttributeValue[]
}

model ProductAttributeValue {
  id String @id @default(cuid())
  productAttributeId String
  productAttribute ProductAttribute @relation(fields: [productAttributeId], references: [id], onDelete: Cascade)
  value String (@unique within product attribute)
}

model ProductVariantAttribute {
  variantId String
  attributeValueId String
  variant ProductVariant @relation(fields: [variantId], references: [id])
  attributeValue ProductAttributeValue @relation(fields: [attributeValueId], references: [id])
  @@id([variantId, attributeValueId])
}

model ProductReview {
  id String @id @default(cuid())
  productId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId String
  customer Customer @relation(fields: [customerId], references: [id])
  rating Int (1-5)
  title String?
  content String?
  status String @default("pending") // "pending", "approved", "rejected"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Customers & Orders
model Customer {
  id String @id @default(cuid())
  email String @unique
  phone String?
  name String?
  addresses Address[]
  orders Order[]
  reviews ProductReview[]
  couponsRedeemed CouponRedemption[]
  AdminNotes String?
  status String @default("active") // "active", "inactive", "banned"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Address {
  id String @id @default(cuid())
  customerId String
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  type String // "billing", "shipping"
  street String
  city String
  state String
  zip String
  country String
  phone String?
  isDefault Boolean @default(false)
}

model Order {
  id String @id @default(cuid())
  orderNumber String @unique
  customerId String
  customer Customer @relation(fields: [customerId], references: [id])
  items OrderItem[]
  status String @default("pending") // "pending", "confirmed", "shipped", "delivered", "cancelled"
  statusHistory OrderStatusHistory[]
  subtotal Float
  discount Float @default(0)
  couponId String?
  coupon Coupon? @relation(fields: [couponId], references: [id])
  shippingCost Float
  tax Float @default(0)
  total Float
  paymentMethod String // "cod", "card", "wallet", etc.
  paymentStatus String @default("pending") // "pending", "completed", "failed"
  paymentTransactions PaymentTransaction[]
  shippingAddress Address?
  shippingAddressId String?
  courierName String?
  trackingNumber String?
  notes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model OrderItem {
  id String @id @default(cuid())
  orderId String
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  productVariantId String?
  quantity Int
  price Float
  subtotal Float
}

model OrderStatusHistory {
  id String @id @default(cuid())
  orderId String
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status String
  timestamp DateTime @default(now())
  notes String?
}

model PaymentTransaction {
  id String @id @default(cuid())
  orderId String
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  amount Float
  method String // "card", "bank_transfer", "wallet", etc.
  status String // "pending", "completed", "failed"
  transactionId String?
  timestamp DateTime @default(now())
}

// Marketing
model Coupon {
  id String @id @default(cuid())
  code String @unique
  description String?
  type String // "fixed", "percentage", "bogo", "freeship"
  value Float
  maxUseCount Int?
  usedCount Int @default(0)
  validFrom DateTime
  validTo DateTime
  minSpend Float @default(0)
  applicableCategories Category[]
  applicableProducts Product[]
  minOrderValue Float @default(0)
  maxDiscountAmount Float?
  status String @default("active") // "active", "inactive", "expired"
  redemptions CouponRedemption[]
  orders Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CouponRedemption {
  id String @id @default(cuid())
  couponId String
  customerId String
  coupon Coupon @relation(fields: [couponId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  orderId String?
  redeemedAt DateTime @default(now())
}

model FlashSale {
  id String @id @default(cuid())
  name String
  description String?
  startDate DateTime
  endDate DateTime
  items FlashSaleItem[]
  isActive Boolean @default(true)
  featuredBadge Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model FlashSaleItem {
  id String @id @default(cuid())
  flashSaleId String
  flashSale FlashSale @relation(fields: [flashSaleId], references: [id], onDelete: Cascade)
  productId String
  discountType String // "fixed", "percentage"
  discountValue Float
  maxQuantity Int?
  quantitySold Int @default(0)
}

model Announcement {
  id String @id @default(cuid())
  title String
  content String
  type String // "banner", "popup", "email"
  target String // "all", "new_customers", "high_spenders"
  publishedAt DateTime?
  status String @default("draft") // "draft", "published", "archived"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// CMS
model Page {
  id String @id @default(cuid())
  title String
  slug String @unique
  content String // HTML or Markdown
  metaTitle String?
  metaDescription String?
  isPublished Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BlogPost {
  id String @id @default(cuid())
  title String
  slug String @unique
  content String
  excerpt String?
  image String?
  categoryId String?
  category BlogCategory? @relation(fields: [categoryId], references: [id])
  comments BlogComment[]
  metaTitle String?
  metaDescription String?
  isPublished Boolean @default(false)
  publishedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BlogCategory {
  id String @id @default(cuid())
  name String @unique
  slug String @unique
  posts BlogPost[]
}

model BlogComment {
  id String @id @default(cuid())
  postId String
  post BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  author String
  email String
  content String
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())
}

model Banner {
  id String @id @default(cuid())
  title String?
  desktopImageUrl String
  mobileImageUrl String?
  linkUrl String?
  isActive Boolean @default(true)
  position String // "hero", "featured", "sidebar", etc.
  order Int @default(0)
  startDate DateTime?
  endDate DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HomepageSection {
  id String @id @default(cuid())
  title String?
  type String // "hero", "featured_products", "categories", "testimonials", etc.
  order Int @default(0)
  settings Json // Section-specific settings (colors, alignment, etc.)
  items HomepageSectionItem[]
  isActive Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HomepageSectionItem {
  id String @id @default(cuid())
  sectionId String
  section HomepageSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  content Json // Product ID, image URL, text, etc.
  order Int @default(0)
}

model RedirectRule {
  id String @id @default(cuid())
  fromUrl String @unique
  toUrl String
  statusCode Int @default(301) // 301 (permanent) or 302 (temporary)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Settings & Media
model Settings {
  id String @id @default(cuid())
  key String @unique
  value String
  type String // "string", "number", "boolean", "json"
  updatedAt DateTime @updatedAt
}

model MediaAsset {
  id String @id @default(cuid())
  filename String
  url String
  cdnUrl String?
  mimeType String
  fileSize Int
  width Int?
  height Int?
  tags String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Cart & Wishlist (Storefront)
model Cart {
  id String @id @default(cuid())
  customerId String?
  sessionId String? // For anonymous users
  items CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CartItem {
  id String @id @default(cuid())
  cartId String
  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productVariantId String
  quantity Int
  createdAt DateTime @default(now())
}

model Wishlist {
  id String @id @default(cuid())
  customerId String @unique
  products Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔧 TECH STACK & TOOLS

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Headless UI / Radix UI |
| **Forms** | React Hook Form + Zod |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js (Credentials) + JWT |
| **File Upload** | Cloudinary or AWS S3 |
| **Email** | Resend or SendGrid |
| **SMS** | Twilio or BulkSMS BD |
| **Testing** | Jest + React Testing Library, Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel, Railway, or self-hosted VPS |
| **Monitoring** | Sentry (errors), Uptime Robot (health), DataDog (optional) |
| **Payment** | SSLCommerz (Bangladesh), Stripe (optional) |
| **Courier** | Steadfast, Pathao, RedX (Bangladesh) |

---

## 📦 REUSABLE COMPONENT LIBRARY

### Forms
- `ProductForm` — Create/edit product
- `CategoryForm` — Create/edit parent category
- `SubcategoryForm` — Create/edit subcategory (with parent selector)
- `BrandForm` — Create/edit brand
- `AttributeForm` — Create/edit attribute
- `CouponForm` — Create/edit coupon
- `FlashSaleForm` — Create/edit flash sale
- `AnnouncementForm` — Create/edit announcement
- `PageForm` — Create/edit CMS page
- `BlogPostForm` — Create/edit blog post
- `BannerForm` — Create/edit banner
- `CustomerNotesForm` — Add/edit customer notes
- `SettingsForm` — Save settings

### Tables
- `ProductsTable` — With filters, bulk actions
- `OrdersTable` — With status filter, bulk courier
- `CustomersTable` — With search
- `ReviewsTable` — With status filter
- `CouponsTable` — With usage tracking
- `FlashSalesTable` — With time display
- `UsersTable` — With role assignment
- `CategoriesTable` — Parent categories with expand to see subcategories
- `SubcategoriesTable` — Subcategories under parent (nested view or separate page)

### Common
- `Navbar` (admin header)
- `Sidebar` (admin navigation)
- `Breadcrumb`
- `PageHero` (page header with description)
- `DataTable` (generic reusable table)
- `DateRangePicker`
- `ImageUploader` (Cloudinary integration)
- `ImagePicker` (modal for selecting images)
- `StatusBadge` (color-coded status)
- `ConfirmDialog` (delete confirmation)
- `SkeletonLoader` (for loading states)
- `CategoryHierarchyTree` — Tree view for parent/subcategory navigation
- `ParentCategorySelector` — Dropdown/combobox for selecting parent category (used in subcategory form)

---

## ✅ VALIDATION SCHEMAS (Zod)

```typescript
// products
productCreateSchema
productUpdateSchema

// categories & subcategories
categoryCreateSchema        // Parent category
categoryUpdateSchema
subcategoryCreateSchema     // Linked to parent
subcategoryUpdateSchema
moveSubcategorySchema       // Change parent category

// brands
brandCreateSchema
brandUpdateSchema

// attributes
attributeCreateSchema
attributeUpdateSchema
attributeValueSchema

// orders
orderCreateSchema
orderUpdateSchema
orderStatusUpdateSchema

// customers
customerUpdateSchema
customerNotesSchema

// marketing
couponCreateSchema
couponUpdateSchema
flashSaleCreateSchema
flashSaleUpdateSchema
announcementCreateSchema
announcementUpdateSchema

// cms
pageCreateSchema
pageUpdateSchema
blogPostCreateSchema
blogPostUpdateSchema
bannerCreateSchema
bannerUpdateSchema
redirectCreateSchema
redirectUpdateSchema
homepageSectionUpdateSchema

// settings
settingsSchema
userCreateSchema (admin user)
userRoleSchema
paymentGatewaySchema
courierIntegrationSchema
```

---

## 🚀 EXECUTION ROADMAP

**Total Duration: 12–16 weeks** (1 dev + 1 designer)

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1 | 0 | Repo setup, schema, migrations, CI/CD |
| 2–3 | 1 | Admin layout, sidebar, breadcrumbs |
| 4 | 2 | Dashboard + KPIs |
| 5–7 | 3 | Products (PIM) |
| 8 | 4 | Categories, brands, attributes |
| 9 | 5 | Inventory management |
| 10–11 | 6 | Orders (OMS) |
| 12 | 7 | Customers (CRM) |
| 13 | 8 | Reviews moderation |
| 14 | 9 | Marketing (coupons, flash sales, announcements) |
| 15–16 | 10–12 | CMS, Media, Settings |
| 17–18 | 13–14 | Reports, RBAC, Audit logs |
| **19** | **Testing & Deploy** | QA, staging, production |

---

## 🎯 SUCCESS CRITERIA

### MVP (Weeks 1–9)
- ✅ Products, categories, inventory
- ✅ Basic orders
- ✅ Admin users with RBAC
- ✅ Health check: `npm run build` passes

### Phase 1 Complete (Weeks 1–14)
- ✅ All core admin features working
- ✅ Customer module + order management
- ✅ Marketing module (coupons, flash sales)
- ✅ CMS basics (pages, blog, banners)
- ✅ 80% test coverage (critical paths)
- ✅ Deployed to staging

### Production Ready (Week 19+)
- ✅ All features tested end-to-end
- ✅ Performance optimized (load times < 2s)
- ✅ Security audit passed
- ✅ Deployment automated
- ✅ Monitoring & alerting configured
- ✅ Documentation complete

---

## 📋 DEPLOYMENT CHECKLIST

Before production:
- [ ] Database backed up
- [ ] `.env.production` configured with secrets
- [ ] `npm run build` succeeds
- [ ] `npm run test:ci` passes
- [ ] Smoke tests pass
- [ ] HTTPS certificate installed
- [ ] Admin user created
- [ ] Email/SMS configured
- [ ] Payment gateway tested (sandbox)
- [ ] Monitoring (Sentry, Uptime Robot) configured
- [ ] Scaling plan (database pool, caching, CDN)

---

## 🎓 NOTES FOR DEVS

1. **Use server actions (Next.js)** — Simplify API calls; no need for `/api/*` routes for many operations.
2. **Prisma middleware for audit logs** — Auto-log all admin changes.
3. **Zod for all inputs** — Validate before hitting the database.
4. **Tailwind + Headless UI** — Consistent design system from Day 1.
5. **Feature flags** — Use to roll out features gradually (e.g., `FEATURE_MEDIA_LIBRARY`).
6. **Tests earlier, not later** — Write tests as you build; don't backfill.
7. **Deploy to staging first** — Always verify before production.

---

**Ready to execute? Start with PHASE 0. All 14 phases planned.**
