/**
 * GET  /api/admin/flash-sale  — list flash sale rules (active and scheduled)
 * POST /api/admin/flash-sale  — create a new flash sale rule
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const onlyActive = searchParams.get("active") === "true";
  const now = new Date();

  const rules = await prisma.flashSaleRule.findMany({
    where: onlyActive
      ? { isActive: true, startAt: { lte: now }, endAt: { gte: now } }
      : {},
    orderBy: { startAt: "desc" },
  });

  // Enrich with product names
  const tenantId = getDefaultTenantId();
  const productIds = Array.from(new Set(rules.map((r) => r.productId)));
  const products = await prisma.product.findMany({
    where: { tenantId, id: { in: productIds } },
    select: { id: true, nameEn: true, nameBn: true, sku: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return NextResponse.json(
    rules.map((r) => ({ ...r, product: productMap.get(r.productId) ?? null }))
  );
}

const CreateFlashSaleSchema = z.object({
  productId: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  discountPct: z.number().min(1).max(99),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateFlashSaleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const start = new Date(parsed.data.startAt);
  const end = new Date(parsed.data.endAt);
  if (end <= start) {
    return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
  }

  const rule = await prisma.flashSaleRule.create({
    data: {
      productId: parsed.data.productId,
      startAt: start,
      endAt: end,
      discountPct: parsed.data.discountPct,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}
