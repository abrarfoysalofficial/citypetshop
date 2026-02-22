/**
 * PATCH  /api/admin/product-filters/[id]
 * DELETE /api/admin/product-filters/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  labelEn: z.string().min(1).optional(),
  labelBn: z.string().optional(),
  type: z.enum(["select", "range", "checkbox"]).optional(),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const filter = await prisma.productFilter.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(filter);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  await prisma.productFilter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
