import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ reason: z.string().min(1, "Cancellation reason is required") });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;

  try {
    const body = schema.parse(await request.json());

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, paymentStatus: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const nonCancellable = ["delivered", "refunded", "cancelled"];
    if (nonCancellable.includes(order.status)) {
      return NextResponse.json({ error: `Cannot cancel order with status: ${order.status}` }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: {
          status: "cancelled",
          paymentStatus: order.paymentStatus === "paid" ? "refunded" : undefined,
        },
        select: { id: true, status: true, paymentStatus: true },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: "cancelled",
          provider: "admin",
          payloadSummary: { action: "cancel", reason: body.reason },
        },
      });
      await tx.orderNote.create({
        data: {
          orderId: id,
          type: "system",
          visibility: "admin",
          message: `Order cancelled by admin. Reason: ${body.reason}`,
        },
      });
      return o;
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("cancel order error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
