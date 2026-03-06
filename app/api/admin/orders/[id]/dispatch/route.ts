import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  trackingNumber: z.string().optional(),
  courier: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;

  try {
    const body = schema.parse(await request.json());

    const tenantId = getDefaultTenantId();
    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      select: { id: true, status: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const dispatchableStatuses = ["processing", "pending"];
    if (!dispatchableStatuses.includes(order.status)) {
      return NextResponse.json({ error: `Cannot dispatch order with status: ${order.status}` }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status: "shipped" };
    if (body.trackingNumber) updateData.trackingCode = body.trackingNumber;
    if (body.courier) updateData.courierProvider = body.courier;

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: updateData,
        select: { id: true, status: true, trackingCode: true },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: "shipped",
          provider: body.courier ?? "admin",
          payloadSummary: {
            action: "dispatch",
            trackingCode: body.trackingNumber,
            courier: body.courier,
            note: body.note,
          },
        },
      });
      return o;
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("dispatch order error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
