import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/src/data/provider";
import { getSubcategoryByFullSlug } from "@/lib/categories-master";

/** GET: Top products for a subcategory (by fullSlug). Used by mega menu. */
export async function GET(request: NextRequest) {
  const fullSlug = request.nextUrl.searchParams.get("fullSlug");
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 6, 12);
  if (!fullSlug) {
    return NextResponse.json({ products: [] });
  }
  const sub = getSubcategoryByFullSlug(fullSlug);
  const categorySlug = fullSlug.includes("/") ? fullSlug.split("/")[0]! : fullSlug;
  const subSlug = fullSlug.includes("/") ? fullSlug.split("/")[1]! : null;

  const all = await getProducts();
  let filtered = all.filter((p) => p.categorySlug === categorySlug);
  if (sub && subSlug) {
    const bySub = filtered.filter(
      (p) =>
        (p as { subcategorySlug?: string }).subcategorySlug === subSlug ||
        (p as { subcategorySlug?: string }).subcategorySlug === fullSlug ||
        p.tags?.includes(subSlug) ||
        p.tags?.includes(fullSlug)
    );
    if (bySub.length > 0) filtered = bySub;
  }
  const products = filtered.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images?.[0] ?? p.image ?? "/products/placeholder.webp",
    slug: (p as { slug?: string }).slug ?? p.id,
  }));
  return NextResponse.json({ products });
}
