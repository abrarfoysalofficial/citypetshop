/**
 * GET /api/admin/reports/orders
 * Order report with date range, status filters, CSV export.
 */
import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "draft", "pending", "processing", "shipped", "handed_to_courier",
  "delivered", "cancelled", "returned", "refund_requested", "refunded", "failed",
];

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const statusParam = searchParams.get("status");
  const format = searchParams.get("format"); // csv | json

  const tenantId = getDefaultTenantId();
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);
  const where: Prisma.OrderWhereInput = { tenantId };
  if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
  if (statusParam && VALID_ORDER_STATUSES.includes(statusParam as OrderStatus)) {
    where.status = statusParam as OrderStatus;
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
    totalDelivery: orders.reduce((s, o) => s + Number(o.deliveryCharge), 0),
    totalDiscount: orders.reduce((s, o) => s + Number(o.discountAmount), 0),
  };

  if (format === "csv") {
    const headers = ["id", "createdAt", "status", "total", "customer", "phone", "payment"];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt.toISOString(),
      o.status,
      Number(o.total),
      o.guestName ?? o.shippingName ?? "",
      o.guestPhone ?? o.shippingPhone ?? "",
      o.paymentMethod ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=order-report.csv",
      },
    });
  }

  return NextResponse.json({
    summary,
    orders: orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      total: Number(o.total),
      customerName: o.guestName ?? o.shippingName,
      phone: o.guestPhone ?? o.shippingPhone ?? "",
      paymentMethod: o.paymentMethod,
      itemCount: o.items.length,
    })),
  });
}
