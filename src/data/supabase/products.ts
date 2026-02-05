import type { Product } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getProducts(): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") {
    throw new Error("Supabase data source is not enabled. Set NEXT_PUBLIC_DATA_SOURCE=supabase");
  }
  // TODO: fetch from Supabase
  return [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return [];
}

export async function getFlashSaleProducts(_limit = 8): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return [];
}

export async function getClearanceProducts(_limit = 8): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return [];
}

export async function getRecommendedProducts(
  _categorySlug: string,
  _excludeId: string,
  _limit = 4
): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return [];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return null;
}
