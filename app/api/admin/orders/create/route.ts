/**
 * POST /api/admin/orders/create
 * Manual order creation by admin. Uses Prisma transaction.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuthAndPermission } from "@lib/admin-auth";
import { logAdminAction } from "@lib/rbac";

export const dynamic = "force-dynamic";

const orderItemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Item name required"),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name required"),
  phone: z.string().min(1, "Phone required"),
  email: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.string().min(1, "Address required"),
  shippingCity: z.string().min(1, "City required"),
  shippingArea: z.string().optional(),
  shippingNotes: z.string().optional(),
  orderNotes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  subtotal: z.number().min(0).optional(),
  deliveryCharge: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  total: z.number().min(0),
  paymentMethod: z.string().default("cod"),
  voucherCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuthAndPermission("orders.create");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status ?? 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return NextResponse.json(
      { error: "Validation failed", details: err.fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const itemsSubtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const subtotal = data.subtotal ?? itemsSubtotal;
  const deliveryCharge = data.deliveryCharge ?? 0;
  const discountAmount = data.discountAmount ?? 0;
  const total = data.total ?? subtotal + deliveryCharge - discountAmount;

  try {
    const tenantId = getDefaultTenantId();
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tenantId,
          userId: null,
          guestEmail: data.email?.trim() || null,
          guestPhone: data.phone.trim(),
          guestName: data.customerName.trim(),
          status: "pending",
          subtotal,
          deliveryCharge,
          discountAmount,
          total,
          paymentMethod: data.paymentMethod || "cod",
          paymentStatus: "pending",
          shippingName: data.customerName.trim(),
          shippingPhone: data.phone.trim(),
          shippingEmail: data.email?.trim() || null,
          shippingAddress: data.shippingAddress.trim(),
          shippingCity: data.shippingCity.trim(),
          shippingArea: data.shippingArea?.trim() || null,
          shippingNotes: data.shippingNotes?.trim() || null,
          orderNotes: data.orderNotes?.trim() || null,
          voucherCode: data.voucherCode?.trim() || null,
        },
      });

      const orderItems = data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId || null,
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        totalPrice: item.qty * item.price,
      }));

      await tx.orderItem.createMany({ data: orderItems });

      return order;
    });

    await logAdminAction(
      auth.userId,
      "create",
      "order",
      result.id,
      undefined,
      { orderId: result.id, total: Number(result.total) },
      { headers: request.headers }
    );

    return NextResponse.json({ orderId: result.id });
  } catch (err) {
    console.error("[admin/orders/create] POST error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
