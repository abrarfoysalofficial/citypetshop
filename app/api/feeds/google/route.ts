import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/feeds/google
 * Google Merchant Center product feed — RSS 2.0 / Google Shopping XML.
 * Cached for 1 hour (fed into merchant center via scheduled fetch).
 */
export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 1000,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

  const items = products
    .map((p) => {
      const imageUrl = p.metaOgImage ?? p.images[0]?.url ?? `${baseUrl}/placeholder.webp`;
      const availability = (Number(p.stock ?? 0) > 0) ? "in stock" : "out of stock";
      const price = `${Number(p.sellingPrice).toFixed(2)} BDT`;
      const description = escapeXml((p.descriptionEn ?? p.nameEn ?? "").slice(0, 5000));
      const title = escapeXml(p.nameEn);

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${baseUrl}/product/${escapeXml(p.id)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>City Plus Pet Shop</g:brand>
      <g:google_product_category>Animals &amp; Pet Supplies</g:google_product_category>
      <g:identifier_exists>false</g:identifier_exists>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>City Plus Pet Shop Products</title>
    <link>${baseUrl}</link>
    <description>Product feed for Google Merchant Center</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
