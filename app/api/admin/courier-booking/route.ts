import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { bookCourier } from "@lib/courier/booking";
import { createAuditLog } from "@lib/audit";
import { z } from "zod";
import type { CourierProvider } from "@lib/courier/key-registry";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["pathao", "steadfast", "redx"]),
});

/** POST: Book courier for one order. Idempotent. Returns 409 if provider not configured. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { orderId, provider } = parsed.data as { orderId: string; provider: CourierProvider };

  const tenantId = getDefaultTenantId();
  const result = await bookCourier(tenantId, orderId, provider);

  if (result.success) {
    await createAuditLog({
      userId: auth.userId,
      action: "create",
      resource: "courier_booking",
      resourceId: orderId,
      newValues: { provider, trackingCode: result.trackingCode, consignmentId: result.consignmentId, idempotent: result.idempotent },
    });
    return NextResponse.json({
      success: true,
      trackingCode: result.trackingCode,
      provider,
      consignmentId: result.consignmentId,
      idempotent: result.idempotent,
    });
  }

  const status = result.status ?? 500;
  return NextResponse.json(
    { error: result.error, providerNotConfigured: status === 409 },
    { status: status as 404 | 409 | 500 }
  );
}

/** GET: List bookings for an order */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const events = await prisma.orderStatusEvent.findMany({
    where: { orderId, provider: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ events });
}
