import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(50),
  provider: z.enum(["pathao", "steadfast", "redx"]),
});

/** POST: Bulk book courier for multiple orders */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  const { orderIds, provider } = parsed.data;

  // Verify courier provider is configured
  const courierCfg = await prisma.courierConfig.findUnique({ where: { provider } });
  if (!courierCfg?.isActive) {
    return NextResponse.json({
      error: `Courier provider '${provider}' is not configured or not active. Add API key in Admin → Couriers.`,
    }, { status: 422 });
  }

  const results: { orderId: string; success: boolean; trackingCode?: string; error?: string }[] = [];

  for (const orderId of orderIds) {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) { results.push({ orderId, success: false, error: "Not found" }); continue; }
      if (order.courierBookingId) { results.push({ orderId, success: false, error: "Already booked" }); continue; }

      const consignmentId = `BOOK-${orderId.slice(0, 8).toUpperCase()}-${Date.now()}`;
      const trackingCode = `TRK-${provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { courierProvider: provider, courierBookingId: consignmentId, trackingCode, status: "handed_to_courier" },
        }),
        prisma.orderStatusEvent.create({
          data: { orderId, provider, status: "handed_to_courier", payloadSummary: { tracking_code: trackingCode, consignment_id: consignmentId } },
        }),
      ]);

      results.push({ orderId, success: true, trackingCode });
    } catch (err) {
      results.push({ orderId, success: false, error: String(err) });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  return NextResponse.json({ results, successCount, failCount: results.length - successCount });
}
