import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@lib/auth";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { isPrismaConfigured } from "@/src/config/env";
import { checkFraud, recordFraudFlag } from "@lib/fraud";
import { rateLimit, getRateLimitKey } from "@lib/rate-limit";
import { assertBodySize } from "@lib/request-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHECKOUT_ORDERS_PER_IP = 5;
const BODY_LIMIT_BYTES = 256 * 1024; // 256KB

const orderItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

type InsufficientStockItem = { productId: string; name: string; requested: number; available: number };
type ProductPriceRow = { id: string; stock: number; selling_price: unknown; discount_percent: unknown; name_en: string };

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

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate stock and create order in a single transaction. Returns 409 payload on insufficient stock. */
async function createOrderPrisma(
  body: z.infer<typeof checkoutOrderSchema>
): Promise<{ orderId: string } | { insufficientStock: InsufficientStockItem[] }> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;

  const tenantId = getDefaultTenantId();

  // Aggregate requested qty per productId (catalog items only)
  const productQtys = new Map<string, number>();
  for (const item of body.items) {
    if (item.productId && uuidRegex.test(item.productId)) {
      const qty = item.qty ?? 1;
      productQtys.set(item.productId, (productQtys.get(item.productId) ?? 0) + qty);
    }
  }

  return prisma.$transaction(async (tx) => {
    // Lock, validate stock, and fetch server-side prices for catalog products
    const insufficient: InsufficientStockItem[] = [];
    const productPriceMap = new Map<string, number>();
    for (const [productId, requested] of Array.from(productQtys.entries())) {
      const rows = await tx.$queryRaw<ProductPriceRow[]>`
        SELECT id, stock, selling_price, discount_percent, name_en FROM products
        WHERE id = ${productId}::uuid AND tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
        FOR UPDATE
      `;
      const row = rows[0];
      const available = row ? Number(row.stock ?? 0) : 0;
      const name = row?.name_en ?? "Unknown";
      if (available < requested) {
        insufficient.push({ productId, name, requested, available });
      }
      if (row) {
        const sellingPrice = Number(row.selling_price ?? 0);
        const discountPercent = Number(row.discount_percent ?? 0) || 0;
        const effectivePrice = discountPercent > 0
          ? Math.round(sellingPrice * (1 - discountPercent / 100) * 100) / 100
          : sellingPrice;
        productPriceMap.set(productId, Math.max(0, effectivePrice));
      }
    }
    if (insufficient.length > 0) {
      throw { type: "INSUFFICIENT_STOCK" as const, insufficient };
    }

    const shippingName = body.customerName.trim();
    const shippingEmail =
      typeof body.email === "string" && body.email.trim() ? body.email.trim() : "guest@checkout.local";
    const shippingPhone = typeof body.phone === "string" ? body.phone.trim() || "N/A" : "N/A";
    const shippingAddressText = typeof body.shippingAddress === "string" ? body.shippingAddress.trim() : "";
    const shippingCityText = typeof body.shippingCity === "string" ? body.shippingCity.trim() : "N/A";
    const paymentMethodValue =
      typeof body.paymentMethod === "string" && body.paymentMethod ? body.paymentMethod : "cod";

    // Use server-side prices for catalog items; client price for custom items (no productId)
    const orderItems = body.items.map((item) => {
      const qty = item.qty ?? 1;
      const unitPrice =
        item.productId && uuidRegex.test(item.productId)
          ? (productPriceMap.get(item.productId) ?? item.price ?? 0)
          : (item.price ?? 0);
      return {
        orderId: "" as string,
        productId: item.productId && uuidRegex.test(item.productId) ? item.productId : null,
        productName: item.name ?? "Item",
        quantity: qty,
        unitPrice,
        totalPrice: qty * unitPrice,
      };
    });

    const itemsSubtotal = orderItems.reduce((s, i) => s + i.totalPrice, 0);
    const orderSubtotal = itemsSubtotal;
    const orderDeliveryCharge = typeof body.deliveryCharge === "number" ? body.deliveryCharge : 0;
    const orderDiscountAmount = typeof body.discountAmount === "number" ? body.discountAmount : 0;
    const orderTotal = Math.max(0, orderSubtotal + orderDeliveryCharge - orderDiscountAmount);

    const order = await tx.order.create({
    data: {
      tenantId,
      userId,
      guestEmail: userId ? null : shippingEmail,
      guestPhone: userId ? null : shippingPhone,
      guestName: userId ? null : shippingName,
      status: "pending",
      subtotal: orderSubtotal,
      deliveryCharge: orderDeliveryCharge,
      discountAmount: orderDiscountAmount,
      total: orderTotal,
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

    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await tx.orderItem.createMany({
      data: orderItemsWithOrderId.map(({ orderId, productId, productName, quantity, unitPrice, totalPrice }) => ({
        orderId,
        productId,
        productName,
        quantity,
        unitPrice,
        totalPrice,
      })),
    });

    // Inventory logs for stock reduction (order placed)
    for (const [productId, qty] of Array.from(productQtys.entries())) {
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: qty } },
      });
      await tx.inventoryLog.create({
        data: {
          productId,
          type: "out",
          quantity: -qty,
          refId: order.id,
          note: "Order placed",
        },
      });
    }

  // Send order confirmation notifications (non-blocking – failures don't abort order)
  // Idempotent: tryAcquireNotificationSlot prevents duplicates; recipient stored truncated only
  try {
    const { sendOrderConfirmationEmail, sendOrderStatusSms } = await import("@lib/notifications");
    const {
      tryAcquireNotificationSlot,
      updateNotificationLog,
      truncateRecipient,
      NOTIFICATION_TYPES,
    } = await import("@lib/notification-log");

    const notifyPhone = shippingPhone && shippingPhone !== "N/A" ? shippingPhone : null;
    const notifyEmail = shippingEmail && !shippingEmail.endsWith("@checkout.local") ? shippingEmail : null;

    if (notifyPhone) {
      const recipientTruncated = truncateRecipient(notifyPhone, "sms");
      const acquired = await tryAcquireNotificationSlot(
        tenantId,
        order.id,
        NOTIFICATION_TYPES.ORDER_STATUS_SMS_CONFIRMED,
        "sms",
        recipientTruncated
      );
      if (acquired) {
        sendOrderStatusSms(notifyPhone, order.id, "confirmed", undefined, tenantId)
          .then(async (res) => {
            if (res.ok) {
              return updateNotificationLog(tenantId, order.id, NOTIFICATION_TYPES.ORDER_STATUS_SMS_CONFIRMED, {
                provider: res.provider,
                messageId: res.messageId,
              });
            }
            const { logWarn } = await import("@lib/logger");
            logWarn("checkout", "SMS notification failed", {
              orderId: order.id,
              provider: res.provider,
              error: res.error,
            });
          })
          .catch(async (err) => {
            const { logWarn } = await import("@lib/logger");
            logWarn("checkout", "SMS notification error", {
              orderId: order.id,
              error: err instanceof Error ? err.message : "unknown",
            });
          });
      }
    }

    if (notifyEmail) {
      const recipientTruncated = truncateRecipient(notifyEmail, "email");
      const acquired = await tryAcquireNotificationSlot(
        tenantId,
        order.id,
        NOTIFICATION_TYPES.ORDER_CONFIRMATION_EMAIL,
        "email",
        recipientTruncated
      );
      if (acquired) {
        sendOrderConfirmationEmail({
          tenantId,
          to: notifyEmail,
          orderId: order.id,
          customerName: shippingName,
          items: orderItemsWithOrderId.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.unitPrice })),
          total: orderTotal,
          shippingAddress: `${shippingAddressText}, ${shippingCityText}`,
          paymentMethod: paymentMethodValue,
        })
          .then(async (res) => {
            if (res.ok) {
              return updateNotificationLog(tenantId, order.id, NOTIFICATION_TYPES.ORDER_CONFIRMATION_EMAIL, {
                provider: res.provider,
                messageId: res.messageId,
              });
            }
            const { logWarn } = await import("@lib/logger");
            logWarn("checkout", "Email notification failed", {
              orderId: order.id,
              provider: res.provider,
              error: res.error,
            });
          })
          .catch(async (err) => {
            const { logWarn } = await import("@lib/logger");
            logWarn("checkout", "Email notification error", {
              orderId: order.id,
              error: err instanceof Error ? err.message : "unknown",
            });
          });
      }
    }
  } catch (err) {
    const { logWarn } = await import("@lib/logger");
    logWarn("checkout", "Notification setup failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
  }

    return { orderId: order.id };
  });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(getRateLimitKey("checkout:order", request), CHECKOUT_ORDERS_PER_IP);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many orders. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  const sizeCheck = assertBodySize(request, BODY_LIMIT_BYTES);
  if (sizeCheck) return sizeCheck;

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
    if (fraudResult && fraudResult.flags.length > 0 && "orderId" in result) {
      await recordFraudFlag(result.orderId, fraudResult.flags.join(","), fraudResult.score, {
        ip,
        phone: parsed.data.phone,
      });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "type" in err && err.type === "INSUFFICIENT_STOCK" && "insufficient" in err) {
      const items = err.insufficient as InsufficientStockItem[];
      const names = items.map((i) => `${i.name} (requested: ${i.requested}, available: ${i.available})`).join("; ");
      return NextResponse.json(
        {
          error: "Insufficient stock for one or more items",
          insufficientStock: items,
        },
        { status: 409 }
      );
    }
    const { logError } = await import("@lib/logger");
    logError("checkout/order", "Order creation failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    const msg = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
