import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPrismaConfigured } from "@/src/config/env";
import { AUTH_MODE } from "@/src/config/runtime";

export const dynamic = "force-dynamic";

/** Returns delivered orders with items for the logged-in user (for review order dropdown). */
export async function GET(request: NextRequest) {
  let userId: string | null = null;

  if (AUTH_MODE === "demo") {
    const session = request.cookies.get("demo_session")?.value;
    if (session === "user" || session === "admin") {
      return NextResponse.json({ orders: [] });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPrismaConfigured()) {
    const session = await getServerSession(authOptions);
    userId = (session?.user as { id?: string })?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json({ orders: [] });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const days = (settings?.reviewEligibleDays as number | null) ?? 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const ordersData = await prisma.order.findMany({
    where: {
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
