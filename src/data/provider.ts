/**
 * Data provider: Prisma/PostgreSQL as single source of truth.
 * When DATABASE_URL is set, uses provider-db only. No Supabase/Sanity/local imports at runtime.
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
import { DATA_SOURCE, AUTH_MODE } from "@/src/config/runtime";
import { isPrismaConfigured, isSupabaseConfigured } from "@/src/config/env";

export type { AdminAnalyticsResult, AdminDashboardStats } from "./admin-types";

/** Prisma as single source of truth when DATABASE_URL set. */
function shouldUsePrisma() {
  return isPrismaConfigured() || DATA_SOURCE === "prisma";
}

/** Use Supabase only when explicitly configured; prevents import of non-existent modules. */
function shouldUseSupabase() {
  return AUTH_MODE === "supabase" && isSupabaseConfigured();
}

export async function getProducts(): Promise<Product[]> {
  if (shouldUsePrisma()) {
    const { getProducts: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (shouldUsePrisma()) {
    const { getFeaturedProducts: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getRecommendedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  if (shouldUsePrisma()) {
    const { getRecommendedProducts: getPrisma } = await import("./provider-db");
    return getPrisma(categorySlug, excludeId, limit);
  }
  return [];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (shouldUsePrisma()) {
    const { getProductById: getPrisma } = await import("./provider-db");
    return getPrisma(id);
  }
  return null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (shouldUsePrisma()) {
    const { getProductBySlug: getPrisma } = await import("./provider-db");
    return getPrisma(slug);
  }
  return null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (shouldUsePrisma()) {
    const { getBlogPosts: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  const { getBlogPosts: getLocal } = await import("./local/blog");
  return getLocal();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (shouldUsePrisma()) {
    const { getBlogPostBySlug: getPrisma } = await import("./provider-db");
    return getPrisma(slug);
  }
  const { getBlogPostBySlug: getLocal } = await import("./local/blog");
  return getLocal(slug);
}

export async function getHomeData(): Promise<HomeSection> {
  if (shouldUsePrisma()) {
    const { getHomeData: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return {
    heroSlides: [{ id: "1", title: "Welcome", subheadline: "", image: "/placeholder.jpg", href: "/shop", cta: "Shop Now" }],
    featuredCategories: [],
    featuredBrands: [],
    flashSale: null,
    sideBanners: [],
  };
}

export async function getComboOffers(): Promise<ComboOffer[]> {
  if (shouldUsePrisma()) {
    const { getComboOffers: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getFlashSaleProducts(limit = 8): Promise<Product[]> {
  if (shouldUsePrisma()) {
    const { getFlashSaleProducts: getPrisma } = await import("./provider-db");
    return getPrisma(limit);
  }
  return [];
}

export async function getClearanceProducts(limit = 8): Promise<Product[]> {
  if (shouldUsePrisma()) {
    const { getClearanceProducts: getPrisma } = await import("./provider-db");
    return getPrisma(limit);
  }
  return [];
}

// Admin / user data: Prisma first; demo/fallback returns empty. No local/supabase imports.
export async function getAdminDashboard(): Promise<DemoDashboard> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminDashboard: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return { summary: { sales: "0", profit: "0", orders: "0", returnRate: "0", loss: "0" }, salesData: [], activity: [] };
}

export async function getAdminOrders(): Promise<DemoOrder[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminOrders: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getAdminOrderById(id: string): Promise<DemoOrder | null> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminOrderById: getPrisma } = await import("./provider-db");
    return getPrisma(id);
  }
  return null;
}

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminCustomers: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getAdminVouchers(): Promise<DemoVoucher[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminVouchers: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getAdminAuditLogs(): Promise<DemoAuditLog[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminAuditLogs: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

/** Admin products list. */
export async function getAdminProducts(): Promise<ProductRow[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminProducts: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  if (AUTH_MODE === "demo") {
    const { DEMO_PRODUCTS } = await import("@/lib/demo-data");
    return DEMO_PRODUCTS;
  }
  return [];
}

/** Admin site settings. */
export async function getAdminSettings(): Promise<Partial<SiteSettingsRow> | null> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminSettings: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  if (AUTH_MODE === "demo") {
    const { DEMO_SITE_SETTINGS } = await import("@/lib/demo-data");
    return DEMO_SITE_SETTINGS;
  }
  return null;
}

/** Admin payment gateways. */
export async function getAdminPaymentGateways(): Promise<PaymentGatewayRow[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminPaymentGateways: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  if (AUTH_MODE === "demo") {
    const { DEMO_PAYMENT_GATEWAYS } = await import("@/lib/demo-data");
    return DEMO_PAYMENT_GATEWAYS;
  }
  return [];
}

/** Admin analytics events. */
export async function getAdminAnalyticsEvents(params: {
  from?: string;
  to?: string;
  event?: string;
  source?: string;
}): Promise<AdminAnalyticsResult> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminAnalyticsEvents: getPrisma } = await import("./provider-db");
    return getPrisma(params);
  }
  if (AUTH_MODE === "demo") {
    const { DEMO_ANALYTICS_EVENTS } = await import("@/lib/demo-data");
    return {
      events: DEMO_ANALYTICS_EVENTS.events,
      counts: DEMO_ANALYTICS_EVENTS.counts,
      lastReceivedByEvent: DEMO_ANALYTICS_EVENTS.lastReceivedByEvent,
      diagnostics: DEMO_ANALYTICS_EVENTS.diagnostics,
    };
  }
  return { events: [], counts: {}, lastReceivedByEvent: {}, diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: [] } };
}

/** Admin dashboard stats (KPIs, charts, recent orders). */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getAdminDashboardStats: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  if (AUTH_MODE === "demo") {
    return {
      stats: {
        totalRevenue: 45231.89,
        totalOrders: 127,
        totalProducts: 234,
        totalCustomers: 89,
        revenueChange: 12.5,
        ordersChange: 8.2,
      },
      salesData: [
        { name: "Jan", revenue: 4000, orders: 24 },
        { name: "Feb", revenue: 3000, orders: 18 },
        { name: "Mar", revenue: 5000, orders: 32 },
        { name: "Apr", revenue: 4500, orders: 28 },
        { name: "May", revenue: 6000, orders: 38 },
        { name: "Jun", revenue: 5500, orders: 35 },
      ],
      categoryData: [
        { name: "Dog Food", value: 400, count: 45 },
        { name: "Cat Food", value: 300, count: 38 },
        { name: "Toys", value: 200, count: 52 },
        { name: "Accessories", value: 278, count: 41 },
        { name: "Healthcare", value: 189, count: 28 },
      ],
      recentOrders: [
        { id: "ORD-001", customer: "John Doe", total: 1250, status: "delivered", date: "2026-02-05" },
        { id: "ORD-002", customer: "Jane Smith", total: 890, status: "processing", date: "2026-02-05" },
        { id: "ORD-003", customer: "Mike Johnson", total: 2100, status: "shipped", date: "2026-02-04" },
        { id: "ORD-004", customer: "Sarah Williams", total: 450, status: "pending", date: "2026-02-04" },
        { id: "ORD-005", customer: "Tom Brown", total: 1680, status: "delivered", date: "2026-02-03" },
      ],
    };
  }
  return { stats: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0, revenueChange: 0, ordersChange: 0 }, salesData: [], categoryData: [], recentOrders: [] };
}

export async function getUserAccountOverview(): Promise<{
  profile: DemoUserProfile;
  recentOrders: DemoOrder[];
  orderCount: number;
}> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getUserAccountOverview: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return { profile: { id: "", email: "", name: "" }, recentOrders: [], orderCount: 0 };
}

export async function getUserOrders(): Promise<DemoOrder[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getUserOrders: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getUserOrderById(id: string): Promise<DemoOrder | null> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getUserOrderById: getPrisma } = await import("./provider-db");
    return getPrisma(id);
  }
  return null;
}

export async function getUserInvoices(): Promise<DemoInvoice[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getUserInvoices: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  if (AUTH_MODE === "prisma" || shouldUsePrisma() || shouldUseSupabase()) {
    const { getUserReturns: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}
