export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { categories, products } from "@/lib/data";
import { prisma } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

function url(path: string) {
  return `${BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function GET() {
  const staticPaths = [
    "/",
    "/shop",
    "/cart",
    "/checkout",
    "/combo-offers",
    "/compare",
    "/blog",
    "/about",
    "/contact",
    "/entertainment",
    "/track-order",
    "/offers",
    "/privacy",
    "/refund",
    "/terms",
    "/sitemap",
  ];

  let categoryUrls: string[];
  let productUrls: string[];

  if (process.env.DATABASE_URL) {
    try {
      const [cats, prods] = await Promise.all([
        prisma.category.findMany({ select: { slug: true } }),
        prisma.product.findMany({ where: { isActive: true }, select: { id: true } }),
      ]);
      categoryUrls = cats.map((c) => `/category/${c.slug}`);
      productUrls = prods.map((p) => `/product/${p.id}`);
    } catch {
      categoryUrls = categories.map((c) => `/category/${c.slug}`);
      productUrls = products.map((p) => `/product/${p.id}`);
    }
  } else {
    categoryUrls = categories.map((c) => `/category/${c.slug}`);
    productUrls = products.map((p) => `/product/${p.id}`);
  }

  const urls = [
    ...staticPaths.map((p) => ({ loc: url(p), lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...categoryUrls.map((p) => ({ loc: url(p), lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly" as const, priority: 0.7 })),
    ...productUrls.map((p) => ({ loc: url(p), lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly" as const, priority: 0.6 })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
