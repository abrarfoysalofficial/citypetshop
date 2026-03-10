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
import { DATA_SOURCE } from "@/src/config/runtime";
import { isPrismaConfigured } from "@/src/config/env";

export type { AdminAnalyticsResult, AdminDashboardStats } from "./admin-types";

/** Prisma as single source of truth when DATABASE_URL set. */
function shouldUsePrisma() {
  return isPrismaConfigured() || DATA_SOURCE === "prisma";
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  if (shouldUsePrisma()) {
    const { getProductsByIds: getPrisma } = await import("./provider-db");
    return getPrisma(ids);
  }
  return [];
}

export async function getProducts(
  options?: { limit?: number; categorySlug?: string } | number
): Promise<Product[]> {
  if (shouldUsePrisma()) {
    const { getProducts: getPrisma } = await import("./provider-db");
    return getPrisma(options);
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

export async function searchProducts(
  q: string,
  limit = 24,
  page = 1
): Promise<{ products: Product[]; total: number }> {
  if (shouldUsePrisma()) {
    const { searchProducts: searchPrisma } = await import("./provider-db");
    return searchPrisma(q, limit, page);
  }
  return { products: [], total: 0 };
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
    heroSlides: [{ id: "1", title: "Welcome", subheadline: "", image: "/banners/hero-slide-1.jpeg", href: "/shop", cta: "Shop Now" }],
    featuredCategories: [],
    featuredBrands: [],
    flashSale: null,
    sideBanners: [],
  };
}

export async function getCategories(): Promise<{ slug: string; name: string; subcategories: string[] }[]> {
  if (shouldUsePrisma()) {
    const { getCategoriesFromDb } = await import("./provider-db");
    return getCategoriesFromDb();
  }
  return [];
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

// Admin / user data: Prisma only.
export async function getAdminDashboard(): Promise<DemoDashboard> {
  if (shouldUsePrisma()) {
    const { getAdminDashboard: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return { summary: { sales: "0", profit: "0", orders: "0", returnRate: "0", loss: "0" }, salesData: [], activity: [] };
}

export async function getAdminOrders(): Promise<DemoOrder[]> {
  if (shouldUsePrisma()) {
    const { getAdminOrders: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getAdminOrderById(id: string): Promise<DemoOrder | null> {
  if (shouldUsePrisma()) {
    const { getAdminOrderById: getPrisma } = await import("./provider-db");
    return getPrisma(id);
  }
  return null;
}

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  if (shouldUsePrisma()) {
    const { getAdminCustomers: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getAdminVouchers(): Promise<DemoVoucher[]> {
  if (shouldUsePrisma()) {
    const { getAdminVouchers: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getAdminAuditLogs(): Promise<DemoAuditLog[]> {
  if (shouldUsePrisma()) {
    const { getAdminAuditLogs: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

/** Admin products list. */
export async function getAdminProducts(): Promise<ProductRow[]> {
  if (shouldUsePrisma()) {
    const { getAdminProducts: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

/** Admin site settings. */
export async function getAdminSettings(): Promise<Partial<SiteSettingsRow> | null> {
  if (shouldUsePrisma()) {
    const { getAdminSettings: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return null;
}

/** Admin payment gateways. */
export async function getAdminPaymentGateways(): Promise<PaymentGatewayRow[]> {
  if (shouldUsePrisma()) {
    const { getAdminPaymentGateways: getPrisma } = await import("./provider-db");
    return getPrisma();
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
  if (shouldUsePrisma()) {
    const { getAdminAnalyticsEvents: getPrisma } = await import("./provider-db");
    return getPrisma(params);
  }
  return { events: [], counts: {}, lastReceivedByEvent: {}, diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: [] } };
}

/** Admin dashboard stats (KPIs, charts, recent orders). */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (shouldUsePrisma()) {
    const { getAdminDashboardStats: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return { stats: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0, revenueChange: 0, ordersChange: 0 }, salesData: [], categoryData: [], recentOrders: [] };
}

export async function getUserAccountOverview(): Promise<{
  profile: DemoUserProfile;
  recentOrders: DemoOrder[];
  orderCount: number;
}> {
  if (shouldUsePrisma()) {
    const { getUserAccountOverview: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return { profile: { id: "", email: "", name: "" }, recentOrders: [], orderCount: 0 };
}

export async function getUserOrders(): Promise<DemoOrder[]> {
  if (shouldUsePrisma()) {
    const { getUserOrders: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}

export async function getUserOrderById(id: string, userId: string | null): Promise<DemoOrder | null> {
  if (!userId || !shouldUsePrisma()) return null;
  const { getUserOrderById: getPrisma } = await import("./provider-db");
  return getPrisma(id, userId);
}

export async function getUserInvoices(userId: string | null): Promise<DemoInvoice[]> {
  if (!userId || !shouldUsePrisma()) return [];
  const { getUserInvoices: getPrisma } = await import("./provider-db");
  return getPrisma(userId);
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  if (shouldUsePrisma()) {
    const { getUserReturns: getPrisma } = await import("./provider-db");
    return getPrisma();
  }
  return [];
}
