import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getDefaultTenantId } from "@/lib/tenant";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** GET /api/admin/orders/[id]/tags */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;

  const tags = await prisma.orderTag.findMany({
    where: { orderId: id },
    select: { id: true, tag: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ tags });
}

/** POST /api/admin/orders/[id]/tags – add a tag */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;

  try {
    const body = z.object({ tag: z.string().min(1).max(50) }).parse(await request.json());

    const tenantId = getDefaultTenantId();
    const order = await prisma.order.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const existing = await prisma.orderTag.findFirst({
      where: { orderId: id, tag: body.tag },
    });
    if (existing) return NextResponse.json({ message: "Tag already exists", tag: existing });

    const tag = await prisma.orderTag.create({
      data: { orderId: id, tag: body.tag, createdBy: auth.email },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("add tag error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** DELETE /api/admin/orders/[id]/tags – remove a tag by value */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;

  try {
    const body = z.object({ tag: z.string().min(1) }).parse(await request.json());

    await prisma.orderTag.deleteMany({ where: { orderId: id, tag: body.tag } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("remove tag error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
