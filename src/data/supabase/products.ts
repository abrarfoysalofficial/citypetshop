import type { Product } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getProducts(): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") return [];
  // TODO: fetch from Supabase
  return [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") return [];
  return [];
}

export async function getFlashSaleProducts(_limit = 8): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") return [];
  return [];
}

export async function getClearanceProducts(_limit = 8): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") return [];
  return [];
}

export async function getRecommendedProducts(
  _categorySlug: string,
  _excludeId: string,
  _limit = 4
): Promise<Product[]> {
  if (DATA_SOURCE !== "supabase") return [];
  return [];
}

export async function getProductById(_id: string): Promise<Product | null> {
  if (DATA_SOURCE !== "supabase") return null;
  return null;
}

export async function getProductBySlug(_slug: string): Promise<Product | null> {
  if (DATA_SOURCE !== "supabase") return null;
  return null;
}
