/**
 * PATCH  /api/admin/product-filters/[id]
 * DELETE /api/admin/product-filters/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  labelEn: z.string().min(1).optional(),
  labelBn: z.string().optional(),
  type: z.enum(["select", "range", "checkbox"]).optional(),
  config: jsonSchema.optional(),
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

  const {config, ...rest} = parsed.data;
  const data: Prisma.ProductFilterUpdateInput = {...rest};

  if (config !== undefined) {
    data.config = config === null ? Prisma.DbNull : config;
  }
  const filter = await prisma.productFilter.update({
    where: { id },
    data,
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
