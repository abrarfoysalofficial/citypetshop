import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout/order/[id]/payment-status
 * Returns payment status for an order. Used by payment success page to verify.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const tenantId = getDefaultTenantId();
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: { paymentStatus: true, paymentMethod: true, total: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    paid: order.paymentStatus === "paid",
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    total: Number(order.total),
  });
}
