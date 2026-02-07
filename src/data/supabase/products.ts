import type { Product } from "../types";
import { isSupabaseConfigured } from "@/src/config/env";

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  // TODO: fetch from Supabase
  return [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  return [];
}

export async function getFlashSaleProducts(_limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  return [];
}

export async function getClearanceProducts(_limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  return [];
}

export async function getRecommendedProducts(
  _categorySlug: string,
  _excludeId: string,
  _limit = 4
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  return [];
}

export async function getProductById(_id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function getProductBySlug(_slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  return null;
}
