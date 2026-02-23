import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPrismaConfigured } from "@/src/config/env";
import { checkFraud, recordFraudFlag } from "@/lib/fraud";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CHECKOUT_ORDERS_PER_IP = 5;

const orderItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

const checkoutOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "customerName is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  subtotal: z.number().min(0).optional(),
  deliveryCharge: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  total: z.number().min(0),
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  paymentMethod: z.string().optional(),
  voucherCode: z.string().optional(),
});

/** Prisma: create order in Postgres */
async function createOrderPrisma(body: z.infer<typeof checkoutOrderSchema>) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  const shippingName = body.customerName.trim();
  const shippingEmail =
    typeof body.email === "string" && body.email.trim() ? body.email.trim() : "guest@checkout.local";
  const shippingPhone = typeof body.phone === "string" ? body.phone.trim() || "N/A" : "N/A";
  const shippingAddressText = typeof body.shippingAddress === "string" ? body.shippingAddress.trim() : "";
  const shippingCityText = typeof body.shippingCity === "string" ? body.shippingCity.trim() : "N/A";
  const paymentMethodValue =
    typeof body.paymentMethod === "string" && body.paymentMethod ? body.paymentMethod : "cod";

  const itemsSubtotal = body.items.reduce((s, i) => s + (i.qty ?? 1) * (i.price ?? 0), 0);
  const orderSubtotal = typeof body.subtotal === "number" ? body.subtotal : itemsSubtotal;
  const orderDeliveryCharge = typeof body.deliveryCharge === "number" ? body.deliveryCharge : 0;
  const orderDiscountAmount = typeof body.discountAmount === "number" ? body.discountAmount : 0;

  const order = await prisma.order.create({
    data: {
      userId,
      guestEmail: userId ? null : shippingEmail,
      guestPhone: userId ? null : shippingPhone,
      guestName: userId ? null : shippingName,
      status: "pending",
      subtotal: orderSubtotal,
      deliveryCharge: orderDeliveryCharge,
      discountAmount: orderDiscountAmount,
      total: body.total,
      voucherCode: typeof body.voucherCode === "string" ? body.voucherCode.trim() || null : null,
      paymentMethod: paymentMethodValue,
      paymentStatus: "pending",
      shippingName,
      shippingPhone,
      shippingEmail,
      shippingAddress: shippingAddressText || "N/A",
      shippingCity: shippingCityText || "N/A",
    },
  });

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const orderItems = body.items.map((item) => ({
    orderId: order.id,
    productId:
      item.productId && uuidRegex.test(item.productId) ? item.productId : null,
    productName: item.name ?? "Item",
    quantity: item.qty ?? 1,
    unitPrice: item.price ?? 0,
    totalPrice: (item.qty ?? 1) * (item.price ?? 0),
  }));

  await prisma.orderItem.createMany({ data: orderItems });

  // Send order confirmation notifications (non-blocking – failures don't abort order)
  try {
    const { sendOrderConfirmationEmail, sendOrderStatusSms } = await import("@/lib/notifications");
    const notifyPhone = shippingPhone && shippingPhone !== "N/A" ? shippingPhone : null;
    const notifyEmail = shippingEmail && !shippingEmail.endsWith("@checkout.local") ? shippingEmail : null;

    if (notifyPhone) {
      sendOrderStatusSms(notifyPhone, order.id, "confirmed").catch(() => {});
    }
    if (notifyEmail) {
      sendOrderConfirmationEmail({
        to: notifyEmail,
        orderId: order.id,
        customerName: shippingName,
        items: body.items.map((i) => ({ name: i.name, quantity: i.qty ?? 1, price: i.price })),
        total: body.total,
        shippingAddress: `${shippingAddressText}, ${shippingCityText}`,
        paymentMethod: paymentMethodValue,
      }).catch(() => {});
    }
  } catch {
    // Notification errors never block order creation
  }

  return { orderId: order.id };
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey("checkout:order", request), CHECKOUT_ORDERS_PER_IP);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many orders. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutOrderSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  // Phase 10: Fraud check (Prisma only)
  let fraudResult: Awaited<ReturnType<typeof checkFraud>> | null = null;
  if (isPrismaConfigured()) {
    fraudResult = await checkFraud({
      phone: parsed.data.phone,
      email: parsed.data.email,
      ip,
      address: parsed.data.shippingAddress,
      orderTotal: parsed.data.total,
    });
    if (!fraudResult.passed) {
      return NextResponse.json(
        { error: fraudResult.blockReason ?? "Order blocked for security reasons" },
        { status: 403 }
      );
    }
  }

  try {
    const result = await createOrderPrisma(parsed.data);
    // Log borderline fraud flags (passed but had flags)
    if (fraudResult && fraudResult.flags.length > 0 && result.orderId) {
      await recordFraudFlag(result.orderId, fraudResult.flags.join(","), fraudResult.score, {
        ip,
        phone: parsed.data.phone,
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[checkout/order]:", err);
    const msg = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
