/**
 * PATCH  /api/admin/blog-categories/[id]
 * DELETE /api/admin/blog-categories/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameBn: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cat = await prisma.blogCategory.update({
    where: { id: (await params).id },
    data: parsed.data,
  });
  return NextResponse.json(cat);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await prisma.blogCategory.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}
