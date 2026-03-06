/**
 * GET /api/admin/customers/repeat
 * Returns repeat customers: grouped by phone, with order count, last order, COD stats.
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const tenantId = getDefaultTenantId();
    const orders = await prisma.order.findMany({
      where: { tenantId, status: { notIn: ["cancelled", "failed"] } },
      select: {
        id: true,
        guestPhone: true,
        guestName: true,
        guestEmail: true,
        shippingName: true,
        total: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    const byPhone = new Map<
      string,
      {
        phone: string;
        name: string;
        email: string | null;
        orderCount: number;
        totalSpent: number;
        lastOrderAt: string;
        lastOrderId: string;
        codOrderCount: number;
        codTotal: number;
      }
    >();

    for (const o of orders) {
      const phone = (o.guestPhone ?? "").trim().replace(/\D/g, "").slice(-11) || "unknown";
      if (phone === "unknown") continue;

      const existing = byPhone.get(phone);
      const totalNum = Number(o.total);
      const isCod = (o.paymentMethod ?? "cod").toLowerCase() === "cod";

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += totalNum;
        if (isCod) {
          existing.codOrderCount += 1;
          existing.codTotal += totalNum;
        }
        if (new Date(o.createdAt) > new Date(existing.lastOrderAt)) {
          existing.lastOrderAt = o.createdAt.toISOString();
          existing.lastOrderId = o.id;
        }
      } else {
        byPhone.set(phone, {
          phone: o.guestPhone ?? phone,
          name: o.guestName ?? o.shippingName ?? "—",
          email: o.guestEmail,
          orderCount: 1,
          totalSpent: totalNum,
          lastOrderAt: o.createdAt.toISOString(),
          lastOrderId: o.id,
          codOrderCount: isCod ? 1 : 0,
          codTotal: isCod ? totalNum : 0,
        });
      }
    }

    const repeatCustomers = Array.from(byPhone.values())
      .filter((c) => c.orderCount >= 2)
      .sort((a, b) => b.orderCount - a.orderCount);

    return NextResponse.json({ customers: repeatCustomers });
  } catch (err) {
    console.error("[admin/customers/repeat] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
