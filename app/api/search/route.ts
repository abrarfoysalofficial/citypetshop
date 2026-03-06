import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@lib/data/db-products";
import { isPrismaConfigured } from "@/src/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LIMIT = 48;
const DEFAULT_LIMIT = 24;

/**
 * GET /api/search?q=...&page=1&limit=24
 * Returns products matching search query with pagination.
 * Uses Prisma contains (case-insensitive) on nameEn, nameBn, descriptionEn, slug, seoTags.
 */
export async function GET(request: NextRequest) {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ products: [], total: 0 }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)));

  const { products, total } = await searchProducts(q, limit, page);

  return NextResponse.json({
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
