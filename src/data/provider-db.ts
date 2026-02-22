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
import type { AdminAnalyticsResult, AdminDashboardStats } from "./admin-types";
import * as dbProducts from "@/lib/data/db-products";
import { prisma } from "@/lib/db";

export type { AdminAnalyticsResult, AdminDashboardStats } from "./admin-types";

// Products
export const getProducts = dbProducts.getProducts;
export const getFeaturedProducts = dbProducts.getFeaturedProducts;
export const getFlashSaleProducts = dbProducts.getFlashSaleProducts;
export const getClearanceProducts = dbProducts.getClearanceProducts;
export const getProductById = dbProducts.getProductById;
export const getProductBySlug = dbProducts.getProductBySlug;
export const getRecommendedProducts = dbProducts.getRecommendedProducts;

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

// Home - from site_settings + home_banner_slides
export async function getHomeData(): Promise<HomeSection> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  const heroRaw = (settings?.heroSlider as { image_url?: string; title_en?: string; link?: string; order?: number }[]) ?? [];
  const heroSlides = heroRaw.map((s, i) => ({
    id: String(i),
    title: s.title_en ?? "",
    subheadline: "",
    image: s.image_url ?? "/placeholder.jpg",
    href: s.link ?? "/shop",
    cta: "Shop Now",
  }));
  if (heroSlides.length === 0) {
    heroSlides.push({ id: "1", title: "Welcome", subheadline: "", image: "/placeholder.jpg", href: "/shop", cta: "Shop Now" });
  }
  const slides = await prisma.homeBannerSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const fromSlides = slides.map((s) => ({
    id: s.id,
    title: s.titleEn ?? "",
    subheadline: "",
    image: s.imageUrl,
    href: s.link ?? "/shop",
    cta: "Shop Now",
  }));
  const allSlides = fromSlides.length > 0 ? fromSlides : heroSlides;
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });
  return {
    heroSlides: allSlides,
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
    href: `/product/${p.id}`,
    cta: "View",
  }));
}

// Admin
export async function getAdminDashboard(): Promise<DemoDashboard> {
  const [orderCount, productCount, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "delivered" } }),
  ]);
  const recentOrders = await prisma.order.findMany({
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
  const orders = await prisma.order.findMany({
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
  const o = await prisma.order.findUnique({
    where: { id },
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

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  const orders = await prisma.order.groupBy({
    by: ["guestEmail", "guestName", "guestPhone"],
    where: { guestEmail: { not: null } },
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
  const v = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
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
  const rows = await prisma.product.findMany({
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
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
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
  const [orderCount, productCount, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "delivered" } }),
  ]);
  const recentOrders = await prisma.order.findMany({
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

export async function getUserOrderById(id: string): Promise<DemoOrder | null> {
  return getAdminOrderById(id);
}

export async function getUserInvoices(): Promise<DemoInvoice[]> {
  return [];
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  return [];
}
