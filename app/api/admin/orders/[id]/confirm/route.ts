import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getDefaultTenantId } from "@/lib/tenant";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ note: z.string().optional() });

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
    if (!["pending", "draft"].includes(order.status)) {
      return NextResponse.json({ error: `Cannot confirm order with status: ${order.status}` }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: "processing" },
        select: { id: true, status: true },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: "processing",
          provider: "admin",
          payloadSummary: body.note ? { note: body.note, action: "confirm" } : { action: "confirm" },
        },
      });
      return o;
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("confirm order error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
