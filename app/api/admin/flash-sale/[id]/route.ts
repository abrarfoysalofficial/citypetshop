/**
 * PATCH  /api/admin/flash-sale/[id]  — update flash sale rule
 * DELETE /api/admin/flash-sale/[id]  — delete flash sale rule
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  discountPct: z.number().min(1).max(99).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const rule = await prisma.flashSaleRule.update({
    where: { id: params.id },
    data: {
      startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : undefined,
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
      discountPct: parsed.data.discountPct,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json(rule);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await prisma.flashSaleRule.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
