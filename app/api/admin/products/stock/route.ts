import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PatchSchema = z.union([
  // Single update: { productId, quantity, type?, note? }
  z.object({
    productId: z.string().min(1),
    quantity: z.number().int(),
    type: z.enum(["set", "adjust", "restock"]).default("set"),
    note: z.string().optional(),
  }),
  // Legacy single update: { id, stock, note? }
  z.object({
    id: z.string().min(1),
    stock: z.number().int().min(0),
    note: z.string().optional(),
  }),
  // Bulk update: { updates: [{id, stock}] }
  z.object({
    updates: z.array(z.object({
      id: z.string().min(1),
      stock: z.number().int().min(0),
    })).min(1).max(100),
  }),
]);

/**
 * PATCH /api/admin/products/stock
 * Single: { productId, quantity, type, note? }  — set/adjust/restock
 * Legacy: { id, stock, note? }
 * Bulk:   { updates: [{id, stock}] }
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));

  // Bulk update
  if (Array.isArray(body.updates)) {
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data as { updates: { id: string; stock: number }[] };

    const results = await prisma.$transaction(
      data.updates.map(({ id, stock }) =>
        prisma.product.update({ where: { id }, data: { stock } })
      )
    );

    await prisma.inventoryLog.createMany({
      data: data.updates.map(({ id, stock }) => ({
        productId: id,
        type: "adjust",
        quantity: stock,
        note: `Bulk stock update by admin`,
      })),
    });

    return NextResponse.json({ updated: results.length });
  }

  // New format: { productId, quantity, type, note }
  if (body.productId) {
    const parsed = z.object({
      productId: z.string().min(1),
      quantity: z.number().int(),
      type: z.enum(["set", "adjust", "restock"]).default("set"),
      note: z.string().optional(),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { productId, quantity, type, note } = parsed.data;
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, stock: true, nameEn: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const newStock = type === "adjust" ? Math.max(0, (product.stock ?? 0) + quantity) : Math.max(0, quantity);
    const delta = newStock - (product.stock ?? 0);

    const updated = await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
    await prisma.inventoryLog.create({
      data: { productId, type, quantity: delta, note: note ?? `Stock ${type} by admin` },
    });

    return NextResponse.json({ id: updated.id, nameEn: updated.nameEn, stock: updated.stock });
  }

  // Legacy format: { id, stock, note }
  const parsed = z.object({
    id: z.string().min(1),
    stock: z.number().int().min(0),
    note: z.string().optional(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id, stock, note } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, stock: true, nameEn: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const updated = await prisma.product.update({ where: { id }, data: { stock } });
  await prisma.inventoryLog.create({
    data: { productId: id, type: "set", quantity: stock - (product.stock ?? 0), note: note ?? "Manual stock update" },
  });

  return NextResponse.json({ id: updated.id, nameEn: updated.nameEn, stock: updated.stock });
}

/**
 * GET /api/admin/products/stock?lowStock=true&outOfStock=true
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const lowStockOnly = searchParams.get("lowStock") === "true";
  const outOfStockOnly = searchParams.get("outOfStock") === "true";
  const threshold = parseInt(searchParams.get("threshold") ?? "5", 10);

  const where = outOfStockOnly
    ? { isActive: true, stock: { lte: 0 } }
    : lowStockOnly
    ? { isActive: true, stock: { lte: threshold } }
    : { isActive: true };

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      nameEn: true,
      sku: true,
      stock: true,
      lowStockThreshold: true,
      isActive: true,
    },
    orderBy: { stock: "asc" },
    take: 500,
  });

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { stock: true, lowStockThreshold: true },
  });

  const lowStockCount = allProducts.filter(
    (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.lowStockThreshold ?? threshold)
  ).length;
  const outOfStockCount = allProducts.filter((p) => (p.stock ?? 0) <= 0).length;

  return NextResponse.json({
    products,
    lowStockCount,
    outOfStockCount,
    total: allProducts.length,
    threshold,
  });
}
