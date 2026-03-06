/**
 * Courier booking logic — shared by single and bulk routes.
 * Idempotent, tenant-scoped, never logs secrets.
 */
import { createHash } from "crypto";
import { prisma } from "@lib/db";
import { isProviderConfigured, isProviderEnabled, getCourierSandbox } from "./provider-config";
import { getPathaoClient, getPathaoStoreId, createPathaoOrder } from "./pathao-client";
import { logError, logInfo } from "@lib/logger";
import type { CourierProvider } from "./key-registry";

function payloadHash(orderId: string, provider: string): string {
  return createHash("sha256").update(`${orderId}:${provider}:${Date.now()}`).digest("hex").slice(0, 16);
}

export type BookingResult =
  | { success: true; trackingCode: string; consignmentId: string; idempotent?: boolean }
  | { success: false; error: string; status: 404 | 409 | 502 | 500 };

export async function bookCourier(
  tenantId: string,
  orderId: string,
  provider: CourierProvider
): Promise<BookingResult> {
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
  if (!order) {
    return { success: false, error: "Order not found", status: 404 };
  }

  const enabled = await isProviderEnabled(tenantId, provider);
  if (!enabled) {
    logInfo("courier-booking", "Booking outcome", { orderId, provider, ok: false, errorCode: "provider_disabled" });
    return {
      success: false,
      error: `Courier provider '${provider}' is not enabled. Enable in Admin → Courier.`,
      status: 409,
    };
  }

  const configured = await isProviderConfigured(tenantId, provider);
  if (!configured) {
    logInfo("courier-booking", "Booking outcome", { orderId, provider, ok: false, errorCode: "provider_not_configured" });
    return {
      success: false,
      error: `Courier provider '${provider}' credentials not configured. Add keys in Admin → Integrations.`,
      status: 409,
    };
  }

  const existing = await prisma.courierBookingLog.findUnique({
    where: { tenantId_orderId_provider: { tenantId, orderId, provider } },
  });
  if (existing) {
    logInfo("courier-booking", "Idempotent return", { orderId, provider, ok: true });
    return {
      success: true,
      trackingCode: existing.trackingCode ?? existing.consignmentId,
      consignmentId: existing.consignmentId,
      idempotent: true,
    };
  }

  const sandbox = await getCourierSandbox(tenantId);
  logInfo("courier-booking", "Booking attempt", { orderId, provider, sandbox });

  if (provider === "pathao") {
    const client = await getPathaoClient(tenantId, sandbox);
    const storeId = await getPathaoStoreId(tenantId);

    if (!client || !storeId) {
      return {
        success: false,
        error: "Pathao credentials incomplete. Add all keys in Admin → Integrations.",
        status: 409,
      };
    }

    const phone = order.shippingPhone || order.guestPhone || "00000000000";
    const result = await createPathaoOrder(client, {
      storeId,
      merchantOrderId: orderId,
      recipientName: order.shippingName || order.guestName || "Customer",
      recipientPhone: phone,
      recipientAddress: [order.shippingAddress, order.shippingCity].filter(Boolean).join(", ") || "N/A",
      itemQuantity: 1,
      itemWeight: 0.5,
      amountToCollect: order.paymentMethod === "cod" ? Number(order.total) : 0,
      itemDescription: `Order ${orderId.slice(0, 8)}`,
    });

    if (!result.success) {
      logInfo("courier-booking", "Booking outcome", { orderId, provider, ok: false, errorCode: "pathao_failed" });
      logError("courier-booking", "Pathao create failed", { orderId, provider, error: result.error });
      return { success: false, error: result.error ?? "Pathao booking failed", status: 502 };
    }

    const requestHash = payloadHash(orderId, provider);
    logInfo("courier-booking", "Booking outcome", { orderId, provider, ok: true, sandbox });

    try {
      await prisma.$transaction([
        prisma.courierBookingLog.create({
          data: {
            tenantId,
            orderId,
            provider,
            consignmentId: result.consignmentId,
            trackingCode: result.consignmentId,
            requestHash,
            sandbox,
            status: "created",
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            courierProvider: provider,
            courierBookingId: result.consignmentId,
            trackingCode: result.consignmentId,
            status: "handed_to_courier",
          },
        }),
        prisma.orderStatusEvent.create({
          data: {
            orderId,
            provider,
            status: "handed_to_courier",
            payloadSummary: { tracking_code: result.consignmentId, consignment_id: result.consignmentId },
          },
        }),
      ]);
      return { success: true, trackingCode: result.consignmentId, consignmentId: result.consignmentId };
    } catch (err) {
      logError("courier-booking", "DB update failed after Pathao success", {
        orderId,
        consignmentId: result.consignmentId,
        error: err instanceof Error ? err.message : "unknown",
      });
      return { success: false, error: "Failed to save booking", status: 500 };
    }
  }

  if (provider === "steadfast" || provider === "redx") {
    return {
      success: false,
      error: `${provider} integration is not yet live. Use Pathao for now.`,
      status: 409,
    };
  }

  return { success: false, error: "Unknown provider", status: 500 };
}
