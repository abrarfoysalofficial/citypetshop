import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { createSslCommerzSession } from "@lib/sslcommerz";
import { getServerBaseUrl } from "@lib/site-url";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/sslcommerz/init
 * Create SSLCommerz session for an existing order. Returns redirect URL.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body.orderId as string;
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const tenantId = getDefaultTenantId();
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentMethod !== "sslcommerz") {
      return NextResponse.json({ error: "Order is not for online payment" }, { status: 400 });
    }

    const baseUrl = getServerBaseUrl();
    const productName = order.items.map((i) => i.productName).join(", ").slice(0, 255) || "Order";

    const result = await createSslCommerzSession({
      orderId: order.id,
      totalAmount: Number(order.total),
      customerName: order.shippingName,
      customerEmail: order.shippingEmail || order.guestEmail || "guest@checkout.local",
      customerPhone: order.shippingPhone,
      customerAddress: order.shippingAddress,
      customerCity: order.shippingCity,
      productName,
      successUrl: `${baseUrl}/payment/success?orderId=${order.id}`,
      failUrl: `${baseUrl}/payment/failed?orderId=${order.id}`,
      cancelUrl: `${baseUrl}/payment/failed?orderId=${order.id}&cancelled=1`,
      ipnUrl: `${baseUrl}/api/webhooks/sslcommerz`,
    });

    if (result.status !== "SUCCESS" || !result.GatewayPageURL) {
      return NextResponse.json(
        { error: result.failedreason || "Failed to create payment session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ redirectUrl: result.GatewayPageURL });
  } catch (err) {
    console.error("[sslcommerz/init]:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
