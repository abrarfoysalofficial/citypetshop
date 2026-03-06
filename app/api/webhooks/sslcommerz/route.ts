import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { validateSslCommerzTransaction } from "@lib/sslcommerz-validate";
import { canTransitionPaymentStatus } from "@lib/order-transitions";
import { logWarn, logError } from "@lib/logger";
import { assertBodySize } from "@lib/request-utils";

export const dynamic = "force-dynamic";

const AMOUNT_TOLERANCE = 0.01;
const BODY_LIMIT_BYTES = 128 * 1024; // 128KB

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isIpAllowed(clientIp: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  const normalized = clientIp.trim();
  return allowlist.some((a) => a.trim() === normalized);
}

function formDataToObject(formData: FormData): object {
  return Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => typeof v === "string").map(([k, v]) => [k, v])
  );
}

/**
 * POST /api/webhooks/sslcommerz
 * SSLCommerz IPN. Validates via Order Validation API, enforces idempotency,
 * amount check, and strict payment_status transitions.
 * Optional: SSLCOMMERZ_IP_ALLOWLIST (comma-separated) — if set, only listed IPs allowed.
 */
export async function POST(request: NextRequest) {
  try {
    const sizeCheck = assertBodySize(request, BODY_LIMIT_BYTES);
    if (sizeCheck) return sizeCheck;

    const allowlistRaw = process.env.SSLCOMMERZ_IP_ALLOWLIST?.trim();
    if (allowlistRaw) {
      const allowlist = allowlistRaw.split(",").map((s) => s.trim()).filter(Boolean);
      const clientIp = getClientIp(request);
      if (!isIpAllowed(clientIp, allowlist)) {
        logWarn("webhooks/sslcommerz", "IP not in allowlist", { clientIp });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const tranId = formData.get("tran_id") as string;
    const valId = (formData.get("val_id") as string) || undefined;
    const status = (formData.get("status") as string) || "";
    const amountStr = formData.get("amount") as string;
    const paidAmount = parseFloat(amountStr || "0");

    if (!tranId) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    const tenantId = getDefaultTenantId();
    const order = await prisma.order.findFirst({
      where: { id: tranId, tenantId },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderTotal = Number(order.total);
    const currentPaymentStatus = order.paymentStatus as "pending" | "paid" | "failed" | "cancelled" | "refunded";

    // Idempotency: already paid - return 200 without re-processing
    if (currentPaymentStatus === "paid") {
      return NextResponse.json({ received: true, reason: "already_paid" });
    }

    const statusUpper = status.toUpperCase();
    const isSuccess = statusUpper === "VALID" || statusUpper === "VALIDATED";
    const isFailure = ["FAILED", "CANCELLED", "EXPIRED"].includes(statusUpper);

    if (isSuccess) {
      // MUST validate with SSLCommerz API before marking paid
      if (!valId) {
        return NextResponse.json({ error: "Missing val_id for VALID status" }, { status: 400 });
      }

      // Idempotency: already processed this val_id
      const existingLog = await prisma.paymentWebhookLog.findUnique({
        where: { valId },
      });
      if (existingLog) {
        return NextResponse.json({ received: true, reason: "duplicate_val_id" });
      }

      const validation = await validateSslCommerzTransaction(valId);
      if (!validation.valid || (validation.status !== "VALID" && validation.status !== "VALIDATED")) {
        logWarn("webhooks/sslcommerz", "Validation failed", { tranId, valId, validationStatus: validation.status });
        return NextResponse.json({ error: "Transaction validation failed" }, { status: 400 });
      }

      // Amount must match
      const validatedAmount = validation.amount ?? paidAmount;
      if (Math.abs(orderTotal - validatedAmount) > AMOUNT_TOLERANCE) {
        logWarn("webhooks/sslcommerz", "Amount mismatch", { tranId, orderTotal, validatedAmount });
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      // Strict transition: only pending -> paid
      if (!canTransitionPaymentStatus(currentPaymentStatus, "paid")) {
        return NextResponse.json({ error: "Invalid payment status transition" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.paymentWebhookLog.create({
          data: {
            orderId: tranId,
            valId,
            gateway: "sslcommerz",
            status: statusUpper,
            amount: validatedAmount,
            rawPayload: formDataToObject(formData),
          },
        }),
        prisma.order.update({
          where: { id: tranId },
          data: {
            paymentStatus: "paid",
            paymentMeta: {
              val_id: valId,
              ipn_status: statusUpper,
              ipn_at: new Date().toISOString(),
              validated: true,
            },
          },
        }),
      ]);
    } else if (isFailure) {
      // FAILED/CANCELLED: validate when val_id present; otherwise trust IPN (forging failed gains nothing)
      if (valId) {
        const existingLog = await prisma.paymentWebhookLog.findUnique({
          where: { valId },
        });
        if (existingLog) {
          return NextResponse.json({ received: true, reason: "duplicate_val_id" });
        }
        const validation = await validateSslCommerzTransaction(valId);
        if (validation.valid) {
          return NextResponse.json({ error: "Validation says VALID but IPN says failed" }, { status: 400 });
        }
      }

      if (!canTransitionPaymentStatus(currentPaymentStatus, "failed")) {
        return NextResponse.json({ received: true, reason: "already_final" });
      }

      await prisma.order.update({
        where: { id: tranId },
        data: {
          paymentStatus: "failed",
          paymentMeta: {
            val_id: valId ?? null,
            ipn_status: statusUpper,
            ipn_at: new Date().toISOString(),
          },
        },
      });

      if (valId) {
        await prisma.paymentWebhookLog.create({
          data: {
            orderId: tranId,
            valId,
            gateway: "sslcommerz",
            status: statusUpper,
            amount: paidAmount || null,
            rawPayload: formDataToObject(formData),
          },
        }).catch((err) => {
          const code = (err as { code?: string })?.code;
          if (code !== "P2002") {
            logError("webhooks/sslcommerz", "PaymentWebhookLog create failed on failure path", {
              error: err instanceof Error ? err.message : "unknown",
              valId,
            });
          }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logError("webhooks/sslcommerz", "IPN processing failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
