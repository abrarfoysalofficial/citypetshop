/**
 * Data provider - self-hosted Postgres via Prisma.
 * Single source: no Supabase, no Sanity, no local.
 */
import type {
  Product,
  BlogPost,
  HomeSection,
  ComboOffer,
  DemoDashboard,
  DemoOrder,
  DemoCustomer,
  DemoVoucher,
  DemoAuditLog,
  DemoUserProfile,
  DemoInvoice,
  DemoReturn,
} from "./types";
import type { ProductRow, SiteSettingsRow, PaymentGatewayRow } from "@/lib/schema";
import { getDefaultTenantId } from "@/lib/tenant";
import type { AdminAnalyticsResult, AdminDashboardStats } from "./admin-types";
import * as dbProducts from "@/lib/data/db-products";
import { prisma } from "@/lib/db";
import { buildProductRoute } from "@/lib/storefront-routes";

export type { AdminAnalyticsResult, AdminDashboardStats } from "./admin-types";

// Categories - for ProductsRepository
export async function getCategoriesFromDb(): Promise<{ slug: string; name: string; subcategories: string[] }[]> {
  const tenantId = getDefaultTenantId();
  const all = await prisma.category.findMany({
    where: { tenantId, deletedAt: null, isActive: true },
    select: { id: true, slug: true, nameEn: true, parentId: true, parent: { select: { slug: true } } },
    orderBy: { sortOrder: "asc" },
  });
  const topLevel = all.filter((c) => !c.parentId);
  const children = all.filter((c) => c.parentId);
  return topLevel.map((p) => ({
    slug: p.slug,
    name: p.nameEn,
    subcategories: children.filter((c) => c.parent?.slug === p.slug).map((c) => c.slug),
  }));
}

// Products
export const getProducts = dbProducts.getProducts;
export const getProductsByIds = dbProducts.getProductsByIds;
export const getFeaturedProducts = dbProducts.getFeaturedProducts;
export const getFlashSaleProducts = dbProducts.getFlashSaleProducts;
export const getClearanceProducts = dbProducts.getClearanceProducts;
export const getProductById = dbProducts.getProductById;
export const getProductBySlug = dbProducts.getProductBySlug;
export const getRecommendedProducts = dbProducts.getRecommendedProducts;
export const searchProducts = dbProducts.searchProducts;

// Blog - from cms_pages
export async function getBlogPosts(): Promise<BlogPost[]> {
  const pages = await prisma.cmsPage.findMany({
    where: { isPublished: true, template: "blog" },
    orderBy: { publishedAt: "desc" },
  });
  return pages.map((p) => ({
    slug: p.slug,
    title: p.titleEn,
    date: p.publishedAt?.toISOString().slice(0, 10) ?? "",
    excerpt: p.excerptEn ?? "",
    coverImage: p.ogImageUrl ?? "/placeholder.jpg",
    thumbnailImage: p.ogImageUrl ?? "/placeholder.jpg",
    metaTitle: p.seoTitle ?? p.titleEn,
    metaDescription: p.seoDescription ?? "",
    keywords: [],
    content: p.contentEn ?? "",
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const p = await prisma.cmsPage.findUnique({
    where: { slug, isPublished: true, template: "blog" },
  });
  if (!p) return null;
  return {
    slug: p.slug,
    title: p.titleEn,
    date: p.publishedAt?.toISOString().slice(0, 10) ?? "",
    excerpt: p.excerptEn ?? "",
    coverImage: p.ogImageUrl ?? "/placeholder.jpg",
    thumbnailImage: p.ogImageUrl ?? "/placeholder.jpg",
    metaTitle: p.seoTitle ?? p.titleEn,
    metaDescription: p.seoDescription ?? "",
    keywords: [],
    content: p.contentEn ?? "",
  };
}

// Home - canonical source: HomeBannerSlide only (no TenantSettings.heroSlider fallback)
export async function getHomeData(): Promise<HomeSection> {
  const tenantId = getDefaultTenantId();
  const slides = await prisma.homeBannerSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const heroSlides =
    slides.length > 0
      ? slides.map((s) => ({
          id: s.id,
          title: s.titleEn ?? "",
          subheadline: "",
          image: s.imageUrl,
          href: s.link ?? "/shop",
          cta: "Shop Now",
        }))
      : [{ id: "default", title: "Welcome", subheadline: "", image: "/banners/hero-slide-1.jpeg", href: "/shop", cta: "Shop Now" }];
  const categories = await prisma.category.findMany({
    where: { tenantId, isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });
  return {
    heroSlides,
    featuredCategories: categories.map((c) => ({
      slug: c.slug,
      name: c.nameEn,
      image: c.imageUrl ?? "/placeholder.jpg",
      href: `/category/${c.slug}`,
    })),
    featuredBrands: [],
    flashSale: null,
    sideBanners: [],
  };
}

// Combo offers - products with combo tag or dedicated table; simplified
export async function getComboOffers(): Promise<ComboOffer[]> {
  const products = await dbProducts.getFeaturedProducts();
  return products.slice(0, 4).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.name,
    description: p.shortDesc,
    image: p.image ?? p.images[0] ?? "/placeholder.jpg",
    price: p.price,
    comparePrice: p.comparePrice,
    productIds: [p.id],
    href: buildProductRoute({
      categorySlug: p.categorySlug,
      subcategorySlug: p.categorySlug,
      id: p.id,
      slug: p.slug,
    }),
    cta: "View",
  }));
}

// Admin
export async function getAdminDashboard(): Promise<DemoDashboard> {
  const tenantId = getDefaultTenantId();
  const [orderCount, productCount, revenue] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId, deletedAt: null } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { tenantId, status: "delivered" } }),
  ]);
  const recentOrders = await prisma.order.findMany({
    where: { tenantId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return {
    summary: {
      sales: String(Number(revenue._sum.total ?? 0)),
      profit: "0",
      orders: String(orderCount),
      returnRate: "0",
      loss: "0",
    },
    salesData: [],
    activity: recentOrders.map((o) => ({
      id: o.id.length,
      text: `Order ${o.id.slice(0, 8)} - ৳${o.total}`,
      time: o.createdAt.toISOString(),
    })),
  };
}

export async function getAdminOrders(): Promise<DemoOrder[]> {
  const tenantId = getDefaultTenantId();
  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders.map((o) => ({
    id: o.id,
    customerId: o.userId ?? undefined,
    customerName: o.shippingName,
    email: o.guestEmail ?? o.shippingEmail ?? undefined,
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      productId: i.productId ?? "",
      name: i.productName,
      qty: i.quantity,
      price: Number(i.unitPrice),
    })),
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
  }));
}

export async function getAdminOrderById(id: string): Promise<DemoOrder | null> {
  const tenantId = getDefaultTenantId();
  const o = await prisma.order.findFirst({
    where: { id, tenantId },
    include: { items: true },
  });
  if (!o) return null;
  return {
    id: o.id,
    customerId: o.userId ?? undefined,
    customerName: o.shippingName,
    email: o.guestEmail ?? o.shippingEmail ?? undefined,
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      productId: i.productId ?? "",
      name: i.productName,
      qty: i.quantity,
      price: Number(i.unitPrice),
    })),
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    courierBookingId: o.courierBookingId ?? undefined,
    trackingCode: o.trackingCode ?? undefined,
    courierProvider: o.courierProvider ?? undefined,
  };
}

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  const tenantId = getDefaultTenantId();
  const orders = await prisma.order.groupBy({
    by: ["guestEmail", "guestName", "guestPhone"],
    where: { tenantId, guestEmail: { not: null } },
    _count: { id: true },
    _max: { createdAt: true },
  });
  return orders
    .filter((o) => o.guestEmail)
    .map((o) => ({
      id: o.guestEmail!,
      name: o.guestName ?? "Guest",
      email: o.guestEmail!,
      phone: o.guestPhone ?? undefined,
      ordersCount: o._count.id,
      lastOrderAt: o._max.createdAt?.toISOString(),
    }));
}

export async function getAdminVouchers(): Promise<DemoVoucher[]> {
  const tenantId = getDefaultTenantId();
  const v = await prisma.voucher.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  return v.map((x) => ({
    id: x.id,
    code: x.code,
    type: x.discountType as "percent" | "fixed",
    value: Number(x.discountValue),
    minPurchase: x.minOrderAmount ? Number(x.minOrderAmount) : undefined,
    startDate: "",
    endDate: x.expiryAt?.toISOString() ?? "",
    active: x.isActive,
    usageCount: x.usageCount,
  }));
}

export async function getAdminAuditLogs(): Promise<DemoAuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });
  return logs.map((l) => {
    const actor = l.user ? (l.user.name || l.user.email || l.userId) : l.userId ?? "system";
    const details = l.newValues
      ? JSON.stringify(l.newValues).slice(0, 100) + (JSON.stringify(l.newValues).length > 100 ? "…" : "")
      : l.oldValues
        ? `(deleted) ${JSON.stringify(l.oldValues).slice(0, 60)}…`
        : undefined;
    return {
      id: l.id,
      action: l.action,
      userId: l.userId ?? undefined,
      entity: `${l.resource} ${l.resourceId}`,
      details: details ?? (actor ? `by ${actor}` : undefined),
      createdAt: l.createdAt.toISOString(),
    };
  });
}

export async function getAdminProducts(): Promise<ProductRow[]> {
  const tenantId = getDefaultTenantId();
  const rows = await prisma.product.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  return rows.map((r) => ({
    id: r.id,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
    name_en: r.nameEn,
    name_bn: r.nameBn,
    slug: r.slug,
    description_en: r.descriptionEn,
    description_bn: r.descriptionBn,
    buying_price: Number(r.buyingPrice),
    selling_price: Number(r.sellingPrice),
    stock: r.stock,
    weight_kg: r.weightKg ? Number(r.weightKg) : null,
    sku: r.sku,
    category_slug: r.categorySlug,
    images: r.images.map((img) => img.url),
    is_featured: r.isFeatured,
    is_active: r.isActive,
    seo_title: r.seoTitle,
    seo_description: r.seoDescription,
    seo_tags: r.seoTags,
    meta_og_image: r.metaOgImage,
  }));
}

export async function getAdminSettings(): Promise<Partial<SiteSettingsRow> | null> {
  const tenantId = getDefaultTenantId();
  const s = await prisma.tenantSettings.findUnique({ where: { tenantId } });
  if (!s) return null;
  return {
    logo_url: s.logoUrl,
    delivery_inside_dhaka: s.deliveryInsideDhaka ? Number(s.deliveryInsideDhaka) : undefined,
    delivery_outside_dhaka: s.deliveryOutsideDhaka ? Number(s.deliveryOutsideDhaka) : undefined,
    free_delivery_threshold: s.freeDeliveryThreshold ? Number(s.freeDeliveryThreshold) : undefined,
    homepage_blocks: s.homepageBlocks as SiteSettingsRow["homepage_blocks"],
  };
}

export async function getAdminPaymentGateways(): Promise<PaymentGatewayRow[]> {
  const rows = await prisma.paymentGateway.findMany();
  return rows.map((r) => ({
    id: r.id,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
    gateway: r.gateway,
    is_active: r.isActive,
    display_name_en: r.displayNameEn,
    display_name_bn: r.displayNameBn,
    credentials_json: r.credentialsJson as Record<string, unknown>,
  }));
}

export async function getAdminAnalyticsEvents(_params: {
  from?: string;
  to?: string;
  event?: string;
  source?: string;
}): Promise<AdminAnalyticsResult> {
  return {
    events: [],
    counts: {},
    lastReceivedByEvent: {},
    diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: [] },
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const tenantId = getDefaultTenantId();
  const [orderCount, productCount, revenue] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId, deletedAt: null } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { tenantId, status: "delivered" } }),
  ]);
  const recentOrders = await prisma.order.findMany({
    where: { tenantId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  return {
    stats: {
      totalRevenue: Number(revenue._sum.total ?? 0),
      totalOrders: orderCount,
      totalProducts: productCount,
      totalCustomers: 0,
      revenueChange: 0,
      ordersChange: 0,
    },
    salesData: [],
    categoryData: [],
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      customer: o.shippingName,
      total: Number(o.total),
      status: o.status,
      date: o.createdAt.toISOString().slice(0, 10),
    })),
  };
}

// User account
export async function getUserAccountOverview(): Promise<{
  profile: DemoUserProfile;
  recentOrders: DemoOrder[];
  orderCount: number;
}> {
  return {
    profile: { id: "", email: "", name: "" },
    recentOrders: [],
    orderCount: 0,
  };
}

export async function getUserOrders(): Promise<DemoOrder[]> {
  return [];
}

export async function getUserOrderById(id: string, userId: string): Promise<DemoOrder | null> {
  if (!userId) return null;
  const tenantId = getDefaultTenantId();
  const o = await prisma.order.findFirst({
    where: { id, tenantId, userId },
    include: { items: true },
  });
  if (!o) return null;
  return {
    id: o.id,
    customerId: o.userId ?? undefined,
    customerName: o.shippingName,
    email: o.guestEmail ?? o.shippingEmail ?? undefined,
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      productId: i.productId ?? "",
      name: i.productName,
      qty: i.quantity,
      price: Number(i.unitPrice),
    })),
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
  };
}

export async function getUserInvoices(userId: string): Promise<DemoInvoice[]> {
  if (!userId) return [];
  const tenantId = getDefaultTenantId();
  const orders = await prisma.order.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, total: true },
  });
  return orders.map((o, i) => ({
    id: o.id,
    orderId: o.id,
    number: `INV-${o.id.slice(0, 8).toUpperCase()}`,
    date: o.createdAt.toISOString().slice(0, 10),
    total: Number(o.total),
    downloadUrl: `/api/invoice?orderId=${o.id}`,
  }));
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  return [];
}
