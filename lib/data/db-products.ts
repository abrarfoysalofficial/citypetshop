/**
 * Product data layer - Prisma (replaces Supabase/Sanity).
 * All queries include tenantId filter. No unscoped queries.
 */
import { prisma } from "@/lib/db";
import { getDefaultTenantId } from "@/lib/tenant";
import type { Product } from "@/src/data/types";
import type { Prisma } from "@prisma/client";

const productInclude: Prisma.ProductInclude = {
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    take: 5,
  },
  brand: { select: { name: true } },
};

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
  const sellingPrice = typeof r.sellingPrice === "number" ? r.sellingPrice : Number(r.sellingPrice);
  const discount = r.discountPercent
    ? (typeof r.discountPercent === "number" ? r.discountPercent : Number(r.discountPercent))
    : 0;
  // Align with checkout: sellingPrice is base; effective = base × (1 − discount/100)
  const price =
    discount > 0
      ? Math.round(sellingPrice * (1 - discount / 100) * 100) / 100
      : sellingPrice;
  const comparePrice = discount > 0 ? sellingPrice : undefined;
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

export type GetProductsOptions = { limit?: number; categorySlug?: string };

export async function getProducts(options?: GetProductsOptions | number): Promise<Product[]> {
  const tenantId = getDefaultTenantId();
  const opts = typeof options === "number" ? { limit: options } : options ?? {};
  const limit = opts.limit ?? 48;
  const where: { tenantId: string; isActive: boolean; deletedAt: null; categorySlug?: string } = {
    tenantId,
    isActive: true,
    deletedAt: null,
  };
  if (opts.categorySlug) where.categorySlug = opts.categorySlug;

  const rows = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const tenantId = getDefaultTenantId();
  const rows = await prisma.product.findMany({
    where: { tenantId, isActive: true, isFeatured: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getFlashSaleProducts(limit = 8): Promise<Product[]> {
  const tenantId = getDefaultTenantId();
  const rows = await prisma.product.findMany({
    where: {
      tenantId,
      isActive: true,
      deletedAt: null,
      discountPercent: { gt: 0 },
    },
    orderBy: { discountPercent: "desc" },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getClearanceProducts(limit = 8): Promise<Product[]> {
  const tenantId = getDefaultTenantId();
  const rows = await prisma.product.findMany({
    where: { tenantId, isActive: true, deletedAt: null },
    orderBy: { sellingPrice: "asc" },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getProductById(id: string): Promise<Product | null> {
  const tenantId = getDefaultTenantId();
  const r = await prisma.product.findFirst({
    where: { id, tenantId, isActive: true, deletedAt: null },
    include: productInclude,
  });
  if (!r) return null;
  return rowToProduct(r);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const tenantId = getDefaultTenantId();
  const r = await prisma.product.findFirst({
    where: { slug, tenantId, isActive: true, deletedAt: null },
    include: productInclude,
  });
  if (!r) return null;
  return rowToProduct(r);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const tenantId = getDefaultTenantId();
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, tenantId, isActive: true, deletedAt: null },
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export async function getRecommendedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const tenantId = getDefaultTenantId();
  const rows = await prisma.product.findMany({
    where: {
      tenantId,
      categorySlug,
      isActive: true,
      deletedAt: null,
      id: { not: excludeId },
    },
    take: limit,
    include: productInclude,
  });
  return rows.map((r) => rowToProduct(r));
}

export type SearchProductsResult = { products: Product[]; total: number };

export async function searchProducts(
  q: string,
  limit = 24,
  page = 1
): Promise<SearchProductsResult> {
  const tenantId = getDefaultTenantId();
  const term = q.trim();
  const skip = (page - 1) * limit;

  if (!term) {
    const rows = await prisma.product.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: productInclude,
    });
    const total = await prisma.product.count({
      where: { tenantId, isActive: true, deletedAt: null },
    });
    return { products: rows.map((r) => rowToProduct(r)), total };
  }

  const searchFilter = {
    OR: [
      { nameEn: { contains: term, mode: "insensitive" as const } },
      { nameBn: { contains: term, mode: "insensitive" as const } },
      { descriptionEn: { contains: term, mode: "insensitive" as const } },
      { slug: { contains: term, mode: "insensitive" as const } },
      { seoTags: { has: term } },
    ],
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        deletedAt: null,
        ...searchFilter,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: productInclude,
    }),
    prisma.product.count({
      where: {
        tenantId,
        isActive: true,
        deletedAt: null,
        ...searchFilter,
      },
    }),
  ]);

  return { products: rows.map((r) => rowToProduct(r)), total };
}
