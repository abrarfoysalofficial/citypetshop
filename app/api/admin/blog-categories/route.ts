/**
 * GET  /api/admin/blog-categories — list
 * POST /api/admin/blog-categories — create
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const categories = await prisma.blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(categories);
}

const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  nameEn: z.string().min(1),
  nameBn: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cat = await prisma.blogCategory.create({
    data: parsed.data,
  });
  return NextResponse.json(cat, { status: 201 });
}
