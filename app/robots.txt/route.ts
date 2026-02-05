import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /studio
Sitemap: ${BASE.replace(/\/$/, "")}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
