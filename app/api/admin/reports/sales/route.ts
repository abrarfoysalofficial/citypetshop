import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const tenantId = getDefaultTenantId();
  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to ? new Date(to) : new Date();

  const [totalRevenue, orderCount, orders] = await Promise.all([
    prisma.order.aggregate({
      where: {
        tenantId,
        status: { in: ["delivered", "processing", "shipped", "handed_to_courier"] },
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        tenantId,
        status: { not: "cancelled" },
        createdAt: { gte: fromDate, lte: toDate },
      },
    }),
    prisma.order.findMany({
      where: { tenantId, createdAt: { gte: fromDate, lte: toDate } },
      select: { id: true, total: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const byStatus = await prisma.order.groupBy({
    by: ["status"],
    where: { tenantId, createdAt: { gte: fromDate, lte: toDate } },
    _count: { id: true },
  });

  return NextResponse.json({
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    orderCount,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
    recentOrders: orders.map((o) => ({
      id: o.id,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  });
}
