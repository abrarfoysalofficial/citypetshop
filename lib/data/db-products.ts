/**
 * Product data layer - Prisma (replaces Supabase/Sanity).
 * All queries include images and brand relations.
 */
import { prisma } from "@/lib/db";
import type { Product } from "@/src/data/types";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 5 },
  brand: { select: { name: true } },
} as const;

type ProductRow = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string | null;
  categorySlug: string;
  sellingPrice: { toNumber?: () => number } | number;
  discountPercent: { toNumber?: () => number } | number | null;
  stock: number | null;
  descriptionEn: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoTags: string[];
  rating: { toNumber?: () => number } | number | null;
  images: { url: string }[];
  brand: { name: string } | null;
};

function rowToProduct(r: ProductRow): Product {
  const price = typeof r.sellingPrice === "number" ? r.sellingPrice : Number(r.sellingPrice);
  const discount = r.discountPercent
    ? (typeof r.discountPercent === "number" ? r.discountPercent : Number(r.discountPercent))
    : 0;
  const comparePrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : undefined;
  const imageUrls = r.images.map((i) => i.url).filter(Boolean);
  return {
    id: r.id,
    slug: r.slug,
    name: r.nameEn,
    category: r.categorySlug,
    categorySlug: r.categorySlug,
    brand: r.brand?.name ?? undefined,
    price,
    comparePrice,
    rating: r.rating ? Number(r.rating) : undefined,
    inStock: (r.stock ?? 0) > 0,
    shortDesc: r.descriptionEn ?? "",
    longDesc: r.descriptionEn ?? undefined,
    images: imageUrls,
    image: imageUrls[0] ?? undefined,
    tags: r.seoTags ?? undefined,
    seo: r.seoTitle
      ? {
          metaTitle: r.seoTitle,
          metaDescription: r.seoDescription ?? "",
          keywords: r.seoTags ?? [],
        }
      : undefined,
    stockQuantity: r.stock ?? undefined,
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getFlashSaleProducts(limit = 8): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      discountPercent: { gt: 0 },
    },
    orderBy: { discountPercent: "desc" },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getClearanceProducts(limit = 8): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sellingPrice: "asc" },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getProductById(id: string): Promise<Product | null> {
  const r = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: productInclude,
  });
  if (!r) return null;
  return rowToProduct(r);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const r = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: productInclude,
  });
  if (!r) return null;
  return rowToProduct(r);
}

export async function getRecommendedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      categorySlug,
      isActive: true,
      id: { not: excludeId },
    },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}
