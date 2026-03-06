import { NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { createAuditLog } from "@lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "pending", "processing", "shipped", "handed_to_courier",
    "delivered", "cancelled", "returned", "refund_requested", "refunded", "failed",
  ]),
  note: z.string().optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = schema.parse(await request.json());

    const prev = await prisma.order.findUnique({
      where: { id: body.orderId },
      select: { status: true },
    });

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: body.orderId },
        data: { status: body.status },
        select: { id: true, status: true },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: body.orderId,
          status: body.status,
          provider: "admin",
          payloadSummary: body.note ? { note: body.note } : undefined,
        },
      });
      return order;
    });

    await createAuditLog({
      userId: auth.userId,
      action: "update",
      resource: "order",
      resourceId: body.orderId,
      oldValues: prev ? { status: prev.status } : undefined,
      newValues: { status: body.status, note: body.note },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("order status PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
