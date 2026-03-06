/**
 * GET /api/admin/orders
 * Fetch orders from Prisma. Supports queue filters: tab, status.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

const QUEUE_STATUS: Record<string, string[]> = {
  pending: ["pending"],
  accepted: ["processing", "shipped", "handed_to_courier", "delivered"],
  rejected: ["cancelled", "returned", "refunded", "failed"],
  booking: ["pending"], // Orders needing courier booking
  packing: ["processing"],
  collection: ["shipped", "handed_to_courier"], // Ready for pickup/delivery
};

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "all";
  const statusFilter = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  try {
    const tenantId = getDefaultTenantId();
    const where: Record<string, unknown> = { tenantId };

    if (tab && tab !== "all" && QUEUE_STATUS[tab]) {
      where.status = { in: QUEUE_STATUS[tab] };
    } else if (statusFilter) {
      where.status = { in: [statusFilter] };
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { guestName: { contains: q, mode: "insensitive" } },
        { shippingName: { contains: q, mode: "insensitive" } },
        { guestPhone: { contains: q } },
        { guestEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        userId: true,
        guestEmail: true,
        guestPhone: true,
        guestName: true,
        shippingName: true,
        shippingEmail: true,
        status: true,
        total: true,
        createdAt: true,
        courierBookingId: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            product: { select: { nameEn: true, nameBn: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customerName: order.guestName || order.shippingName || "Guest",
      email: order.guestEmail || order.shippingEmail || "",
      phone: order.guestPhone || "",
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      courierBookingId: order.courierBookingId,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (err) {
    console.error("[admin/orders] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
