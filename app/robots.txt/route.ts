import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshopbd.com";

export async function GET() {
  const base = BASE.replace(/\/$/, "");
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${base}/sitemap.xml
`;
  return new NextResponse(txt, {
    headers: { "Content-Type": "text/plain" },
  });
}
