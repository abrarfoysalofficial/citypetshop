import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: List abandoned/draft orders (draft_orders + orders with status draft) */
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const minAgeMinutes = parseInt(searchParams.get("minAge") ?? "30", 10);
  const cutoff = new Date(Date.now() - minAgeMinutes * 60 * 1000);

  const [drafts, draftOrders] = await Promise.all([
    prisma.order.findMany({
      where: { status: "draft", createdAt: { lte: cutoff } },
      take: 50,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        guestEmail: true,
        guestPhone: true,
        guestName: true,
        total: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.draftOrder.findMany({
      where: { lastActivityAt: { lte: cutoff } },
      take: 50,
      orderBy: { lastActivityAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    draftOrders: draftOrders.map((d) => ({
      id: d.id,
      sessionId: d.sessionId,
      guestEmail: d.guestEmail,
      guestPhone: d.guestPhone,
      guestName: d.guestName,
      cartJson: d.cartJson,
      shippingJson: d.shippingJson,
      lastActivityAt: d.lastActivityAt.toISOString(),
    })),
    draftOrdersFromOrders: drafts.map((o) => ({
      id: o.id,
      guestEmail: o.guestEmail,
      guestPhone: o.guestPhone,
      guestName: o.guestName,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
  });
}
