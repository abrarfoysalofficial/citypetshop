/**
 * GET   /api/admin/cms-pages/[id]
 * PATCH /api/admin/cms-pages/[id]
 * DELETE /api/admin/cms-pages/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const page = await prisma.cmsPage.findUnique({
    where: { id: (await params).id },
    include: { blogCategory: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

const patchSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleBn: z.string().optional(),
  contentEn: z.string().optional(),
  contentBn: z.string().optional(),
  excerptEn: z.string().optional(),
  excerptBn: z.string().optional(),
  isPublished: z.boolean().optional(),
  template: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  blogCategoryId: z.string().uuid().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data };
  if (data.isPublished !== undefined && data.isPublished) {
    (data as { publishedAt?: Date }).publishedAt = new Date();
  }

  const page = await prisma.cmsPage.update({
    where: { id: (await params).id },
    data,
  });
  return NextResponse.json(page);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await prisma.cmsPage.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}
