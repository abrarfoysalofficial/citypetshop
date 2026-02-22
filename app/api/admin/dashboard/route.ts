import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuthAndPermission } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: Dashboard stats from Prisma. No demo data. */
export async function GET() {
  const auth = await requireAdminAuthAndPermission("analytics.view");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    // Get basic stats
    const [totalOrders, totalProducts, totalCustomers, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true }
      })
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
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

    // Get sales data for last 6 months (simplified)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { total: true },
      _count: true,
      orderBy: { createdAt: 'asc' }
    });

    // Group by month
    const monthlyData = salesData.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { revenue: 0, orders: 0 };
      }
      acc[month].revenue += Number(order._sum.total || 0);
      acc[month].orders += order._count;
      return acc;
    }, {} as Record<string, { revenue: number; orders: number }>);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const chartData = months.map(month => ({
      name: month,
      revenue: monthlyData[month]?.revenue || 0,
      orders: monthlyData[month]?.orders || 0
    }));

    // Category data (simplified)
    const categoryStats = await prisma.product.groupBy({
      by: ['categorySlug'],
      _count: true,
      where: { categorySlug: { not: "" } }
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
        revenueChange: 0, // TODO: calculate from previous period
        ordersChange: 0
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
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
