import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { DEMO_PAYMENT_GATEWAYS } from "@/lib/demo-data";
import { AUTH_MODE } from "@/src/config/runtime";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payment-gateways
 * Admin: Prisma or Supabase. Demo: static data.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (AUTH_MODE === "prisma") {
    try {
      const rows = await prisma.paymentGateway.findMany({
        orderBy: { gateway: "asc" },
      });
      return NextResponse.json(
        rows.map((r) => ({
          id: r.id,
          created_at: r.createdAt.toISOString(),
          updated_at: r.updatedAt.toISOString(),
          gateway: r.gateway,
          is_active: r.isActive,
          display_name_en: r.displayNameEn,
          display_name_bn: r.displayNameBn,
          credentials_json: r.credentialsJson,
        }))
      );
    } catch (err) {
      console.error("[api/admin/payment-gateways] Prisma error:", err);
      return NextResponse.json(DEMO_PAYMENT_GATEWAYS);
    }
  }

  if (AUTH_MODE === "demo") {
    return NextResponse.json(DEMO_PAYMENT_GATEWAYS);
  }

  return NextResponse.json(DEMO_PAYMENT_GATEWAYS);
}

/**
 * PATCH /api/admin/payment-gateways
 * Update a payment gateway. Prisma or Supabase.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing gateway id" }, { status: 400 });
    }

    if (AUTH_MODE === "prisma") {
      const allowed = ["isActive", "displayNameEn", "displayNameBn", "credentialsJson"];
      const data: Record<string, unknown> = {};
      if ("is_active" in updates) data.isActive = updates.is_active;
      if ("display_name_en" in updates) data.displayNameEn = updates.display_name_en;
      if ("display_name_bn" in updates) data.displayNameBn = updates.display_name_bn;
      if ("credentials_json" in updates) data.credentialsJson = updates.credentials_json;

      const updated = await prisma.paymentGateway.update({
        where: { id },
        data,
      });
      return NextResponse.json({
        id: updated.id,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
        gateway: updated.gateway,
        is_active: updated.isActive,
        display_name_en: updated.displayNameEn,
        display_name_bn: updated.displayNameBn,
        credentials_json: updated.credentialsJson,
      });
    }

    return NextResponse.json({ error: "Update not available in demo mode" }, { status: 403 });
  } catch (err) {
    console.error("[api/admin/payment-gateways] PATCH unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
