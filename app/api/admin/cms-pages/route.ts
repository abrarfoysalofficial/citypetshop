/**
 * GET  /api/admin/cms-pages — list
 * POST /api/admin/cms-pages — create
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const template = request.nextUrl.searchParams.get("template");

  const where: { template?: string } = {};
  if (template) where.template = template;

  const pages = await prisma.cmsPage.findMany({
    where,
    include: { blogCategory: { select: { id: true, slug: true, nameEn: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(pages);
}

const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(1),
  titleBn: z.string().optional(),
  contentEn: z.string().optional(),
  contentBn: z.string().optional(),
  excerptEn: z.string().optional(),
  excerptBn: z.string().optional(),
  isPublished: z.boolean().default(false),
  template: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  blogCategoryId: z.string().uuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data, publishedAt: parsed.data.isPublished ? new Date() : null };
  const page = await prisma.cmsPage.create({
    data: {
      ...data,
      blogCategoryId: data.blogCategoryId || null,
    },
  });
  return NextResponse.json(page, { status: 201 });
}
