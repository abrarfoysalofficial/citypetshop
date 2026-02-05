/**
 * Sanity data layer: products. Maps GROQ results to src/data/types Product.
 */
import type { Product } from "../types";
import { sanityFetch } from "@/lib/sanity/client";
import {
  productsQuery,
  productByIdQuery,
  productBySlugQuery,
  featuredProductsQuery,
  productsByIdsQuery,
} from "@/lib/sanity/queries";

const TAGS = ["product"];

function mapDoc(d: Record<string, unknown>): Product {
  const images = (d.images as string[] | undefined) ?? [];
  const image = (d.image as string | undefined) ?? images[0];
  return {
    id: (d.id as string) ?? (d._id as string),
    slug: (d.slug as string) ?? "",
    name: (d.name as string) ?? "",
    category: (d.category as string) ?? "",
    categorySlug: (d.categorySlug as string) ?? "",
    brand: d.brand as string | undefined,
    price: Number(d.price) ?? 0,
    comparePrice: d.comparePrice != null ? Number(d.comparePrice) : undefined,
    rating: d.rating != null ? Number(d.rating) : undefined,
    inStock: (d.inStock as boolean) ?? true,
    shortDesc: (d.shortDesc as string) ?? "",
    longDesc: d.longDesc as string | undefined,
    images,
    image,
    tags: d.tags as string[] | undefined,
    specs: d.specs as Record<string, string> | undefined,
    stockQuantity: d.stockQuantity != null ? Number(d.stockQuantity) : undefined,
    videoUrl: d.videoUrl as string | undefined,
    seo: d.seo as Product["seo"],
  };
}

export async function getProducts(): Promise<Product[]> {
  const list = await sanityFetch<Record<string, unknown>[]>({
    query: productsQuery,
    tags: TAGS,
  });
  return (list ?? []).map(mapDoc);
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await sanityFetch<Record<string, unknown> | null>({
    query: productByIdQuery,
    params: { id },
    tags: TAGS,
  });
  return doc ? mapDoc(doc) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const doc = await sanityFetch<Record<string, unknown> | null>({
    query: productBySlugQuery,
    params: { slug },
    tags: TAGS,
  });
  return doc ? mapDoc(doc) : null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const list = await sanityFetch<Record<string, unknown>[]>({
    query: featuredProductsQuery,
    tags: TAGS,
  });
  return (list ?? []).map(mapDoc);
}

export async function getFlashSaleProducts(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  const tagSet = new Set(["Flash Sale", "flash_sale", "Flash sale"]);
  return all
    .filter((p) => p.tags?.some((t) => tagSet.has(t)))
    .slice(0, limit);
}

export async function getClearanceProducts(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.comparePrice != null && p.comparePrice > p.price)
    .slice(0, limit);
}

export async function getRecommendedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.categorySlug === categorySlug && p.id !== excludeId)
    .slice(0, limit);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const list = await sanityFetch<Record<string, unknown>[]>({
    query: productsByIdsQuery,
    params: { ids },
    tags: TAGS,
  });
  return (list ?? []).map(mapDoc);
}
