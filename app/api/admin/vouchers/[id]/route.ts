import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { AUTH_MODE } from "@/src/config/runtime";
import { isPrismaConfigured } from "@/src/config/env";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/vouchers/[id]
 * Update voucher.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (AUTH_MODE !== "prisma" || !isPrismaConfigured()) {
    return NextResponse.json({ error: "Vouchers require database" }, { status: 400 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (typeof body.discountType === "string") data.discountType = body.discountType;
    if (typeof body.value === "number") data.discountValue = body.value;
    if (typeof body.minSpend === "number") data.minOrderAmount = body.minSpend > 0 ? body.minSpend : null;
    if (typeof body.maxUses === "number") data.usageLimit = body.maxUses > 0 ? body.maxUses : null;
    if (body.validTo !== undefined) data.expiryAt = body.validTo ? new Date(body.validTo) : null;
    if (typeof body.active === "boolean") data.isActive = body.active;

    const v = await prisma.voucher.update({
      where: { id },
      data: data as Parameters<typeof prisma.voucher.update>[0]["data"],
    });
    return NextResponse.json({
      id: v.id,
      code: v.code,
      discountType: v.discountType,
      value: Number(v.discountValue),
      minSpend: v.minOrderAmount ? Number(v.minOrderAmount) : 0,
      maxUses: v.usageLimit ?? 999,
      usedCount: v.usageCount,
      validTo: v.expiryAt?.toISOString().slice(0, 10) ?? "",
      active: v.isActive,
    });
  } catch (err) {
    console.error("[api/admin/vouchers] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update voucher" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/vouchers/[id]
 * Delete voucher.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (AUTH_MODE !== "prisma" || !isPrismaConfigured()) {
    return NextResponse.json({ error: "Vouchers require database" }, { status: 400 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/vouchers] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete voucher" }, { status: 500 });
  }
}
