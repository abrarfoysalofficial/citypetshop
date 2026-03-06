import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuthAndPermission } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: List inventory logs with filtering by product, date, reason (type) */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuthAndPermission("products.view");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? "";
  const productSlug = searchParams.get("productSlug") ?? "";
  const type = searchParams.get("type") ?? "";
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const offset = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {};

    if (productId) where.productId = productId;
    if (type) where.type = type;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) (where.createdAt as Record<string, Date>).gte = new Date(fromDate);
      if (toDate) (where.createdAt as Record<string, Date>).lte = new Date(toDate + "T23:59:59.999Z");
    }

    if (productSlug) {
      const product = await prisma.product.findFirst({
        where: { slug: productSlug },
        select: { id: true },
      });
      if (product) where.productId = product.id;
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    const productIds = Array.from(new Set(logs.map((l) => l.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, nameEn: true, slug: true },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        productId: l.productId,
        productName: productMap[l.productId]?.nameEn ?? "—",
        productSlug: productMap[l.productId]?.slug ?? "—",
        type: l.type,
        quantity: l.quantity,
        refId: l.refId,
        note: l.note,
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[admin/inventory-logs] GET:", error);
    return NextResponse.json({ error: "Failed to fetch inventory logs" }, { status: 500 });
  }
}
