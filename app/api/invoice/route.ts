import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { generateInvoicePDF } from "@lib/pdf-invoice";
import { auth } from "@lib/auth";
import { canAccessInvoice } from "@lib/invoice-auth";
import { logError } from "@lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/invoice?orderId=xxx — generate and return PDF invoice. Requires auth. */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId?.trim()) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const userRole = (session?.user as { role?: string })?.role ?? null;

  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const tenantId = getDefaultTenantId();
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      status: true,
      subtotal: true,
      deliveryCharge: true,
      discountAmount: true,
      total: true,
      shippingName: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      voucherCode: true,
      items: {
        include: {
          product: { select: { nameEn: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowed = canAccessInvoice(
    { userId, userRole },
    { userId: order.userId }
  );
  if (!allowed) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const invoiceOrder = {
    id: order.id,
    created_at: order.createdAt.toISOString(),
    status: order.status,
    subtotal: Number(order.subtotal),
    delivery_charge: Number(order.deliveryCharge),
    discount_amount: Number(order.discountAmount),
    total: Number(order.total),
    shipping_name: order.shippingName,
    shipping_phone: order.shippingPhone,
    shipping_address: order.shippingAddress,
    shipping_city: order.shippingCity,
    voucher_code: order.voucherCode ?? null,
  };

  const invoiceItems = order.items.map((item) => ({
    product_name: item.product?.nameEn ?? item.productName ?? "Unknown Product",
    quantity: item.quantity,
    unit_price: Number(item.unitPrice),
    total_price: Number(item.totalPrice ?? item.unitPrice) * item.quantity,
  }));

  try {
    const pdfBytes = await generateInvoicePDF(invoiceOrder, invoiceItems);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    logError("invoice", "PDF generation failed", {
      error: err instanceof Error ? err.message : "unknown",
      orderId: order.id,
    });
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
