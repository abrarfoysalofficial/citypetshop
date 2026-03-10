import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET: Single landing page with blocks */
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const page = await prisma.landingPage.findUnique({
    where: { id },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

/** PATCH: Update page meta + publish */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const updateData: Record<string, unknown> = {};

  if (typeof body.title === "string") updateData.title = body.title.trim();
  if (typeof body.slug === "string") updateData.slug = body.slug.trim().toLowerCase().replace(/\s+/g, "-");
  if (typeof body.seoTitle === "string") updateData.seoTitle = body.seoTitle;
  if (typeof body.seoDesc === "string") updateData.seoDesc = body.seoDesc;
  if (typeof body.isPublished === "boolean") {
    updateData.isPublished = body.isPublished;
    if (body.isPublished) updateData.publishedAt = new Date();
  }
  if (body.layoutJson !== undefined) updateData.layoutJson = body.layoutJson;

  const page = await prisma.landingPage.update({ where: { id }, data: updateData });
  return NextResponse.json({ page });
}

/** DELETE: Remove landing page */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  await prisma.landingPage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
