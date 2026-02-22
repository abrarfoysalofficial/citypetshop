/**
 * GET  /api/admin/collections  — list all product collections
 * POST /api/admin/collections  — create a collection
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const onlyActive = searchParams.get("active") === "true";

  const collections = await prisma.collection.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(collections);
}

const CreateCollectionSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  nameEn: z.string().min(1),
  nameBn: z.string().optional(),
  productIds: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateCollectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const collection = await prisma.collection.create({
    data: {
      slug: parsed.data.slug,
      nameEn: parsed.data.nameEn,
      nameBn: parsed.data.nameBn,
      productIds: parsed.data.productIds,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json(collection, { status: 201 });
}
