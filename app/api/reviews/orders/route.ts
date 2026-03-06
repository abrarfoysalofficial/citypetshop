import { NextResponse } from "next/server";
import { auth } from "@lib/auth";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { isPrismaConfigured } from "@/src/config/env";

export const dynamic = "force-dynamic";

/** Returns delivered orders with items for the logged-in user (for review order dropdown). */
export async function GET() {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ orders: [] });
  }

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json({ orders: [] });
  }

  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId: getDefaultTenantId() } });
  const days = (settings?.reviewEligibleDays as number | null) ?? 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const tenantId = getDefaultTenantId();
  const ordersData = await prisma.order.findMany({
    where: {
      tenantId,
      userId,
      status: "delivered",
      createdAt: { gte: since },
    },
    select: { id: true, total: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (ordersData.length === 0) return NextResponse.json({ orders: [] });

  const orders = await Promise.all(
    ordersData.map(async (o) => {
      const items = await prisma.orderItem.findMany({
        where: { orderId: o.id },
        select: { productId: true, productName: true, quantity: true, unitPrice: true },
      });
      return {
        id: o.id,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.productName,
          qty: i.quantity,
          price: Number(i.unitPrice),
        })),
      };
    })
  );
  return NextResponse.json({ orders });
}
