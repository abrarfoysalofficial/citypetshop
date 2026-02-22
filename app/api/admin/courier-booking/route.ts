import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["pathao", "steadfast", "redx"]),
});

/** POST: Book courier for one order. Adapter pattern – provider modules are stub until API keys set. */
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
  const { orderId, provider } = parsed.data;

  // Verify order exists
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Stub booking – real providers plug in here via adapter when API keys configured
  const consignmentId = `BOOK-${orderId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const trackingCode = `TRK-${provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // Upsert courier config check (warn if not configured)
  const courierCfg = await prisma.courierConfig.findUnique({ where: { provider } });
  if (!courierCfg?.isActive) {
    return NextResponse.json({
      error: `Courier provider '${provider}' is not configured or not active. Add API key in Admin → Couriers.`,
      providerNotConfigured: true,
    }, { status: 422 });
  }

  // Update order with courier details (atomic)
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        courierProvider: provider,
        courierBookingId: consignmentId,
        trackingCode,
        status: "handed_to_courier",
      },
    }),
    prisma.orderStatusEvent.create({
      data: {
        orderId,
        provider,
        status: "handed_to_courier",
        payloadSummary: { tracking_code: trackingCode, consignment_id: consignmentId },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    trackingCode,
    provider,
    consignmentId,
  });
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
