import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: List landing pages */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const pages = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: { blocks: true },
  });
  return NextResponse.json({ pages });
}

/** POST: Create landing page */
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const slug = (body.slug as string)?.trim()?.toLowerCase().replace(/\s+/g, "-") || `landing-${Date.now()}`;
  const title = (body.title as string)?.trim() || "Untitled";
  const layoutJson = body.layoutJson ?? [];
  const seoTitle = body.seoTitle as string | undefined;
  const seoDesc = body.seoDesc as string | undefined;

  const existing = await prisma.landingPage.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const page = await prisma.landingPage.create({
    data: {
      slug,
      title,
      layoutJson: Array.isArray(layoutJson) ? layoutJson : [],
      seoTitle: seoTitle ?? null,
      seoDesc: seoDesc ?? null,
    },
  });
  return NextResponse.json({ page });
}
