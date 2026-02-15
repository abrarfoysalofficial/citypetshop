import type { Product } from "../types";
import type { ProductRow } from "@/lib/schema";
import { isSupabaseConfigured } from "@/src/config/env";
import { createClient } from "@/lib/supabase/server";

function rowToProduct(row: ProductRow & { brand?: string; rating?: number; discount_percent?: number }): Product {
  const price = Number(row.selling_price ?? 0);
  const comparePrice = row.discount_percent
    ? Math.round(price / (1 - Number(row.discount_percent) / 100))
    : undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name_en,
    category: row.category_slug,
    categorySlug: row.category_slug,
    brand: (row as { brand?: string }).brand ?? undefined,
    price,
    comparePrice,
    rating: (row as { rating?: number }).rating ?? undefined,
    inStock: (row.stock ?? 0) > 0,
    shortDesc: row.description_en ?? "",
    longDesc: row.description_en ?? undefined,
    images: Array.isArray(row.images) ? row.images : [],
    image: Array.isArray(row.images) && row.images[0] ? row.images[0] : undefined,
    tags: row.seo_tags ?? undefined,
    seo: row.seo_title
      ? {
          metaTitle: row.seo_title,
          metaDescription: row.seo_description ?? "",
          keywords: row.seo_tags ?? [],
        }
      : undefined,
    stockQuantity: row.stock ?? undefined,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r: ProductRow) => rowToProduct(r));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return [];
  return (data ?? []).map((r: ProductRow) => rowToProduct(r));
}

export async function getFlashSaleProducts(_limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("discount_percent", 0)
    .order("discount_percent", { ascending: false })
    .limit(_limit);
  if (error) return [];
  return (data ?? []).map((r: ProductRow) => rowToProduct(r));
}

export async function getClearanceProducts(_limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .lt("stock", 10)
    .gt("stock", 0)
    .order("stock", { ascending: true })
    .limit(_limit);
  if (error) return [];
  return (data ?? []).map((r: ProductRow) => rowToProduct(r));
}

export async function getRecommendedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category_slug", categorySlug)
    .neq("id", excludeId)
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((r: ProductRow) => rowToProduct(r));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (error || !data) return null;
  return rowToProduct(data as ProductRow & { brand?: string; rating?: number; discount_percent?: number });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error || !data) return null;
  return rowToProduct(data as ProductRow & { brand?: string; rating?: number; discount_percent?: number });
}
