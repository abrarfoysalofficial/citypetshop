import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/feeds/meta
 * Meta (Facebook) product feed - Catalog format for dynamic ads.
 */
export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 1000,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://citypluspetshop.com";
  const items = products.map((p) => {
    const id = p.id;
    const title = p.nameEn;
    const description = (p.descriptionEn ?? "").slice(0, 5000);
    const link = `${baseUrl}/product/${p.id}`;
    const firstImg = p.images[0];
    const imageLink = p.metaOgImage || (firstImg?.url) || `${baseUrl}/products/placeholder.webp`;
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
