/**
 * Data provider: switches on NEXT_PUBLIC_DATA_SOURCE (local | supabase | sanity).
 * Sanity: products, categories, home, combo offers from Sanity CMS; blog/admin fallback to local.
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
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getProducts(): Promise<Product[]> {
  if (DATA_SOURCE === "local") {
    const { getProducts: getLocal } = await import("./local/products");
    return getLocal();
  }
  if (DATA_SOURCE === "sanity") {
    const { getProducts: getSanity } = await import("./sanity/products");
    return getSanity();
  }
  const { getProducts: getSupabase } = await import("./supabase/products");
  return getSupabase();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (DATA_SOURCE === "local") {
    const { getFeaturedProducts: getLocal } = await import("./local/products");
    return getLocal();
  }
  if (DATA_SOURCE === "sanity") {
    const { getFeaturedProducts: getSanity } = await import("./sanity/products");
    return getSanity();
  }
  const { getFeaturedProducts: getSupabase } = await import("./supabase/products");
  return getSupabase();
}

export async function getRecommendedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  if (DATA_SOURCE === "local") {
    const { getRecommendedProducts: getLocal } = await import("./local/products");
    return getLocal(categorySlug, excludeId, limit);
  }
  if (DATA_SOURCE === "sanity") {
    const { getRecommendedProducts: getSanity } = await import("./sanity/products");
    return getSanity(categorySlug, excludeId, limit);
  }
  const { getRecommendedProducts: getSupabase } = await import("./supabase/products");
  return getSupabase(categorySlug, excludeId, limit);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (DATA_SOURCE === "local") {
    const { getProductById: getLocal } = await import("./local/products");
    return getLocal(id);
  }
  if (DATA_SOURCE === "sanity") {
    const { getProductById: getSanity } = await import("./sanity/products");
    return getSanity(id);
  }
  const { getProductById: getSupabase } = await import("./supabase/products");
  return getSupabase(id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (DATA_SOURCE === "local") {
    const { getProductBySlug: getLocal } = await import("./local/products");
    return getLocal(slug);
  }
  if (DATA_SOURCE === "sanity") {
    const { getProductBySlug: getSanity } = await import("./sanity/products");
    return getSanity(slug);
  }
  const { getProductBySlug: getSupabase } = await import("./supabase/products");
  return getSupabase(slug);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (DATA_SOURCE === "local") {
    const { getBlogPosts: getLocal } = await import("./local/blog");
    return getLocal();
  }
  const { getBlogPosts: getSupabase } = await import("./supabase/blog");
  return getSupabase();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (DATA_SOURCE === "local") {
    const { getBlogPostBySlug: getLocal } = await import("./local/blog");
    return getLocal(slug);
  }
  const { getBlogPostBySlug: getSupabase } = await import("./supabase/blog");
  return getSupabase(slug);
}

export async function getHomeData(): Promise<HomeSection> {
  if (DATA_SOURCE === "local") {
    const { getHomeData: getLocal } = await import("./local/home");
    return getLocal();
  }
  if (DATA_SOURCE === "sanity") {
    const { getHomeData: getSanity } = await import("./sanity/home");
    return getSanity();
  }
  const { getHomeData: getSupabase } = await import("./supabase/home");
  return getSupabase();
}

export async function getComboOffers(): Promise<ComboOffer[]> {
  if (DATA_SOURCE === "local") {
    const { getComboOffers: getLocal } = await import("./local/comboOffers");
    return getLocal();
  }
  if (DATA_SOURCE === "sanity") {
    const { getComboOffers: getSanity } = await import("./sanity/comboOffers");
    return getSanity();
  }
  const { getComboOffers: getSupabase } = await import("./supabase/comboOffers");
  return getSupabase();
}

export async function getFlashSaleProducts(limit = 8): Promise<Product[]> {
  if (DATA_SOURCE === "local") {
    const { getFlashSaleProducts: getLocal } = await import("./local/products");
    return getLocal(limit);
  }
  if (DATA_SOURCE === "sanity") {
    const { getFlashSaleProducts: getSanity } = await import("./sanity/products");
    return getSanity(limit);
  }
  const { getFlashSaleProducts: getSupabase } = await import("./supabase/products");
  return getSupabase(limit);
}

export async function getClearanceProducts(limit = 8): Promise<Product[]> {
  if (DATA_SOURCE === "local") {
    const { getClearanceProducts: getLocal } = await import("./local/products");
    return getLocal(limit);
  }
  if (DATA_SOURCE === "sanity") {
    const { getClearanceProducts: getSanity } = await import("./sanity/products");
    return getSanity(limit);
  }
  const { getClearanceProducts: getSupabase } = await import("./supabase/products");
  return getSupabase(limit);
}

// Admin demo data (DATA_SOURCE=local only; supabase stubs return empty when DATA_SOURCE=supabase)
export async function getAdminDashboard(): Promise<DemoDashboard> {
  if (DATA_SOURCE === "local") {
    const { getAdminDashboard: getLocal } = await import("./local/adminDemo");
    return getLocal();
  }
  const { getAdminDashboard: getSupabase } = await import("./supabase/adminDemo");
  return getSupabase();
}

export async function getAdminOrders(): Promise<DemoOrder[]> {
  if (DATA_SOURCE === "local") {
    const { getAdminOrders: getLocal } = await import("./local/adminDemo");
    return getLocal();
  }
  const { getAdminOrders: getSupabase } = await import("./supabase/adminDemo");
  return getSupabase();
}

export async function getAdminOrderById(id: string): Promise<DemoOrder | null> {
  if (DATA_SOURCE === "local") {
    const { getAdminOrderById: getLocal } = await import("./local/adminDemo");
    return getLocal(id);
  }
  const { getAdminOrderById: getSupabase } = await import("./supabase/adminDemo");
  return getSupabase(id);
}

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  if (DATA_SOURCE === "local") {
    const { getAdminCustomers: getLocal } = await import("./local/adminDemo");
    return getLocal();
  }
  const { getAdminCustomers: getSupabase } = await import("./supabase/adminDemo");
  return getSupabase();
}

export async function getAdminVouchers(): Promise<DemoVoucher[]> {
  if (DATA_SOURCE === "local") {
    const { getAdminVouchers: getLocal } = await import("./local/adminDemo");
    return getLocal();
  }
  const { getAdminVouchers: getSupabase } = await import("./supabase/adminDemo");
  return getSupabase();
}

export async function getAdminAuditLogs(): Promise<DemoAuditLog[]> {
  if (DATA_SOURCE === "local") {
    const { getAdminAuditLogs: getLocal } = await import("./local/adminDemo");
    return getLocal();
  }
  const { getAdminAuditLogs: getSupabase } = await import("./supabase/adminDemo");
  return getSupabase();
}

// User account demo data
export async function getUserAccountOverview(): Promise<{
  profile: DemoUserProfile;
  recentOrders: DemoOrder[];
  orderCount: number;
}> {
  if (DATA_SOURCE === "local") {
    const { getUserAccountOverview: getLocal } = await import("./local/userDemo");
    return getLocal();
  }
  const { getUserAccountOverview: getSupabase } = await import("./supabase/userDemo");
  return getSupabase();
}

export async function getUserOrders(): Promise<DemoOrder[]> {
  if (DATA_SOURCE === "local") {
    const { getUserOrders: getLocal } = await import("./local/userDemo");
    return getLocal();
  }
  const { getUserOrders: getSupabase } = await import("./supabase/userDemo");
  return getSupabase();
}

export async function getUserOrderById(id: string): Promise<DemoOrder | null> {
  if (DATA_SOURCE === "local") {
    const { getUserOrderById: getLocal } = await import("./local/userDemo");
    return getLocal(id);
  }
  const { getUserOrderById: getSupabase } = await import("./supabase/userDemo");
  return getSupabase(id);
}

export async function getUserInvoices(): Promise<DemoInvoice[]> {
  if (DATA_SOURCE === "local") {
    const { getUserInvoices: getLocal } = await import("./local/userDemo");
    return getLocal();
  }
  const { getUserInvoices: getSupabase } = await import("./supabase/userDemo");
  return getSupabase();
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  if (DATA_SOURCE === "local") {
    const { getUserReturns: getLocal } = await import("./local/userDemo");
    return getLocal();
  }
  const { getUserReturns: getSupabase } = await import("./supabase/userDemo");
  return getSupabase();
}
