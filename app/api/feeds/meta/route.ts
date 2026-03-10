import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { buildProductRoute } from "@/lib/storefront-routes";

export const dynamic = "force-dynamic";

/**
 * GET /api/feeds/meta
 * Meta (Facebook) product feed - Catalog format for dynamic ads.
 */
export async function GET() {
  const tenantId = getDefaultTenantId();
  const products = await prisma.product.findMany({
    where: { tenantId, deletedAt: null, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 1000,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://citypetshop.bd";
  const items = products.map((p) => {
    const id = p.id;
    const title = p.nameEn;
    const description = (p.descriptionEn ?? "").slice(0, 5000);
    const link = `${baseUrl}${buildProductRoute({
      categorySlug: p.categorySlug,
      subcategorySlug: p.categorySlug,
      slug: p.slug || p.id,
      id: p.id,
    })}`;
    const firstImg = p.images[0];
    const imageLink = p.metaOgImage || (firstImg?.url) || `${baseUrl}/ui/product-4x3.svg`;
    const price = `${Number(p.sellingPrice)} BDT`;
    const availability = "in stock";

    return {
      id,
      title,
      description,
      link,
      image_link: imageLink,
      price,
      availability,
      brand: "City Plus Pet Shop",
      condition: "new",
    };
  });

  return NextResponse.json(
    { version: "1.0", items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
