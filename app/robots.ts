import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
