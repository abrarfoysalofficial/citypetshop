import type { MetadataRoute } from "next";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { STATIC_BLOG_POSTS } from "@/src/data/blog-posts-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/offers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/combo-offers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/site-map`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let categories: { slug: string }[] = [];
  let products: { id: string }[] = [];
  let blogSlugs: string[] = [];

  if (process.env.DATABASE_URL) {
    try {
      const tenantId = getDefaultTenantId();
      const [cats, prods, posts] = await Promise.all([
        prisma.category.findMany({
          where: { tenantId, deletedAt: null, isActive: true },
          select: { slug: true },
        }),
        prisma.product.findMany({
          where: { tenantId, deletedAt: null, isActive: true },
          select: { id: true },
        }),
        prisma.cmsPage.findMany({
          where: { isPublished: true, template: "blog" },
          select: { slug: true },
        }),
      ]);
      categories = cats;
      products = prods;
      blogSlugs = posts.map((p) => p.slug);
    } catch {
      blogSlugs = STATIC_BLOG_POSTS.map((p) => p.slug);
    }
  } else {
    blogSlugs = STATIC_BLOG_POSTS.map((p) => p.slug);
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/product/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
