import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";
import { logAdminAction } from "@lib/rbac";
import { isPrismaConfigured } from "@/src/config/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/vouchers
 * List all vouchers. Prisma only.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json([]);
  }

  try {
    const tenantId = getDefaultTenantId();
    const rows = await prisma.voucher.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      rows.map((v) => ({
        id: v.id,
        code: v.code,
        discountType: v.discountType,
        value: Number(v.discountValue),
        minSpend: v.minOrderAmount ? Number(v.minOrderAmount) : 0,
        maxUses: v.usageLimit ?? 999,
        usedCount: v.usageCount,
        validFrom: "",
        validTo: v.expiryAt?.toISOString().slice(0, 10) ?? "",
        active: v.isActive,
      }))
    );
  } catch (err) {
    console.error("[api/admin/vouchers] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
  }
}

/**
 * POST /api/admin/vouchers
 * Create voucher. Prisma only.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: "Vouchers require database" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const discountType = (body.discountType as "percent" | "fixed") ?? "percent";
    const value = Number(body.value) ?? 0;
    const minSpend = Number(body.minSpend) ?? 0;
    const maxUses = Number(body.maxUses) ?? 1;
    const validTo = body.validTo ? new Date(body.validTo) : null;
    const active = body.active !== false;

    if (!code || value <= 0) {
      return NextResponse.json({ error: "Code and value required" }, { status: 400 });
    }

    const tenantId = getDefaultTenantId();
    const existing = await prisma.voucher.findFirst({ where: { tenantId, code } });
    if (existing) {
      return NextResponse.json({ error: "Voucher code already exists" }, { status: 400 });
    }

    const v = await prisma.voucher.create({
      data: {
        tenantId,
        code,
        discountType,
        discountValue: value,
        minOrderAmount: minSpend > 0 ? minSpend : null,
        usageLimit: maxUses > 0 ? maxUses : null,
        expiryAt: validTo,
        isActive: active,
      },
    });
    await logAdminAction(auth.userId!, "create", "voucher", v.id, undefined, { code: v.code }, { headers: request.headers });
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
    console.error("[api/admin/vouchers] POST error:", err);
    return NextResponse.json({ error: "Failed to create voucher" }, { status: 500 });
  }
}
