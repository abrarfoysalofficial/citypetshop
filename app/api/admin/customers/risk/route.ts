/**
 * GET /api/admin/customers/risk
 * Returns customers with risk indicators: duplicate phone/address, COD history.
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const tenantId = getDefaultTenantId();
  const orders = await prisma.order.findMany({
    where: { tenantId, status: { notIn: ["cancelled", "failed"] } },
    select: {
      id: true,
      guestPhone: true,
      guestName: true,
      shippingAddress: true,
      shippingCity: true,
      paymentMethod: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const byPhone = new Map<string, {
    name: string | null;
    addresses: Set<string>;
    codCount: number;
    codTotal: number;
    orders: { id: string; total: number }[];
  }>();

  for (const o of orders) {
    const phone = (o.guestPhone ?? "").trim().replace(/\D/g, "").slice(-11) || "unknown";
    if (phone === "unknown") continue;

    const addr = `${(o.shippingAddress ?? "").trim()}|${(o.shippingCity ?? "").trim()}`.toLowerCase();
    const isCod = (o.paymentMethod ?? "cod").toLowerCase() === "cod";
    const totalNum = Number(o.total);

    if (!byPhone.has(phone)) {
      byPhone.set(phone, {
        name: o.guestName ?? null,
        addresses: new Set(),
        codCount: 0,
        codTotal: 0,
        orders: [],
      });
    }
    const r = byPhone.get(phone)!;
    r.addresses.add(addr);
    if (isCod) {
      r.codCount += 1;
      r.codTotal += totalNum;
    }
    r.orders.push({ id: o.id, total: totalNum });
  }

  const risks = Array.from(byPhone.entries())
    .map(([phone, data]) => ({
      phone,
      name: data.name,
      orderCount: data.orders.length,
      addressCount: data.addresses.size,
      codCount: data.codCount,
      codTotal: data.codTotal,
      hasDuplicateAddress: data.addresses.size > 1,
      lastOrderId: data.orders[0]?.id,
    }))
    .filter((r) => r.orderCount >= 2 || r.codTotal > 5000 || r.hasDuplicateAddress)
    .sort((a, b) => b.codTotal - a.codTotal);

  return NextResponse.json({ risks });
}
