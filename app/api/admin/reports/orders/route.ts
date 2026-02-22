/**
 * GET /api/admin/reports/orders
 * Order report with date range, status filters, CSV export.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const format = searchParams.get("format"); // csv | json

  const where: { createdAt?: { gte?: Date; lte?: Date }; status?: string } = {};
  if (from) where.createdAt = { ...where.createdAt, gte: new Date(from) };
  if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };
  if (status) where.status = status;

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
      o.guestPhone ?? "",
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
      phone: o.guestPhone,
      paymentMethod: o.paymentMethod,
      itemCount: o.items.length,
    })),
  });
}
