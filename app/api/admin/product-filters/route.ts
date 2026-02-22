/**
 * GET  /api/admin/product-filters — list
 * POST /api/admin/product-filters — create
 */
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const filters = await prisma.productFilter.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(filters);
}

const createSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9_]+$/),
  labelEn: z.string().min(1),
  labelBn: z.string().optional(),
  type: z.enum(["select", "range", "checkbox"]),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Prisma.ProductFilterCreateInput = {
    ...parsed.data,
    config:
      parsed.data.config !== undefined
        ? (parsed.data.config as Prisma.InputJsonValue)
        : undefined,
  };
  const filter = await prisma.productFilter.create({
    data,
  });
  return NextResponse.json(filter, { status: 201 });
}
