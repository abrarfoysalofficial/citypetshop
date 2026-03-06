import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: Fraud flags pending review */
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const flags = await prisma.fraudFlag.findMany({
    where: { reviewStatus: status },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const tenantId = getDefaultTenantId();
  const orderIds = Array.from(new Set(flags.map((f) => f.orderId)));
  const orders = await prisma.order.findMany({
    where: { tenantId, id: { in: orderIds } },
    select: {
      id: true,
      shippingName: true,
      guestPhone: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });
  const orderMap = Object.fromEntries(orders.map((o) => [o.id, o]));

  return NextResponse.json({
    flags: flags.map((f) => ({
      id: f.id,
      orderId: f.orderId,
      flagType: f.flagType,
      score: f.score,
      reviewStatus: f.reviewStatus,
      reviewedBy: f.reviewedBy,
      reviewedAt: f.reviewedAt?.toISOString(),
      createdAt: f.createdAt.toISOString(),
      details: f.detailsJson,
      order: orderMap[f.orderId],
    })),
  });
}
