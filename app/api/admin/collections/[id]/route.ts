/**
 * GET    /api/admin/collections/[id]  — get single collection
 * PATCH  /api/admin/collections/[id]  — update collection
 * DELETE /api/admin/collections/[id]  — delete collection
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const collection = await prisma.collection.findUnique({ where: { id: params.id } });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(collection);
}

const PatchCollectionSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameBn: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
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

  const parsed = PatchCollectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const collection = await prisma.collection.update({
    where: { id: params.id },
    data: {
      nameEn: parsed.data.nameEn,
      nameBn: parsed.data.nameBn,
      productIds: parsed.data.productIds,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json(collection);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await prisma.collection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
