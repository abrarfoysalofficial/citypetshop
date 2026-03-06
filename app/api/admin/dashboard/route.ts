import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuthAndPermission } from "@lib/admin-auth";
import { percentChange } from "@lib/dashboard-metrics";
import { logApiError } from "@lib/logger";

export const dynamic = "force-dynamic";

/** Rolling 30-day windows: current = last 30 days, previous = 30 days before that. */
function getPeriodBounds() {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 30);
  const prevEnd = new Date(currentStart);
  prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - 30);
  return { now, currentStart, prevStart, prevEnd };
}

/** GET: Dashboard stats from Prisma. No demo data. */
export async function GET(request: Request) {
  const auth = await requireAdminAuthAndPermission("analytics.view");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const tenantId = getDefaultTenantId();
    const { now, currentStart, prevStart, prevEnd } = getPeriodBounds();

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      currentRevenue,
      currentOrders,
      prevRevenue,
      prevOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId, deletedAt: null } }),
      prisma.user.count(),
      prisma.order.aggregate({ where: { tenantId }, _sum: { total: true } }),
      prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: currentStart, lte: now } },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { tenantId, createdAt: { gte: currentStart, lte: now } },
      }),
      prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: prevStart, lte: prevEnd } },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { tenantId, createdAt: { gte: prevStart, lte: prevEnd } },
      }),
    ]);

    const currentRev = Number(currentRevenue._sum.total ?? 0);
    const prevRev = Number(prevRevenue._sum.total ?? 0);
    const revenueChange = percentChange(currentRev, prevRev);
    const ordersChange = percentChange(currentOrders, prevOrders);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shippingName: true,
        total: true,
        status: true,
        createdAt: true
      }
    });

    // Sales data: SQL-level monthly aggregation (last 6 calendar months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRows = await prisma.$queryRaw<
      { month_name: string; revenue: number; orders: number }[]
    >`
      SELECT
        to_char(date_trunc('month', created_at)::date, 'Mon') as month_name,
        COALESCE(SUM(total)::float, 0) as revenue,
        COUNT(*)::int as orders
      FROM orders
      WHERE tenant_id = ${tenantId}::uuid
        AND created_at >= ${sixMonthsAgo}
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `;

    const monthlyData = Object.fromEntries(
      monthlyRows.map((r) => [r.month_name, { revenue: Number(r.revenue), orders: r.orders }])
    );

    const last6MonthNames: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6MonthNames.push(d.toLocaleString("default", { month: "short" }));
    }

    const chartData = last6MonthNames.map((name) => ({
      name,
      revenue: monthlyData[name]?.revenue ?? 0,
      orders: monthlyData[name]?.orders ?? 0,
    }));

    // Category data (simplified)
    const categoryStats = await prisma.product.groupBy({
      by: ['categorySlug'],
      _count: true,
      where: { tenantId, deletedAt: null, categorySlug: { not: "" } }
    });

    const categoryData = categoryStats.map(cat => ({
      name: cat.categorySlug || 'Uncategorized',
      value: cat._count,
      count: cat._count
    }));

    return NextResponse.json({
      stats: {
        totalRevenue: Number(totalRevenue._sum.total || 0),
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueChange,
        ordersChange,
      },
      salesData: chartData,
      categoryData,
      recentOrders: recentOrders.map(order => ({
        id: order.id.slice(0, 8),
        customer: order.shippingName || '—',
        total: Number(order.total),
        status: order.status,
        date: order.createdAt.toLocaleDateString()
      }))
    });
  } catch (error) {
    logApiError(request, error, { scope: "admin/dashboard", status: 500 });
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
