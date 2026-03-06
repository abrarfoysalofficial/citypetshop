/**
 * GET /api/admin/orders/activities
 * Returns combined order activities (notes + status events) for an order or recent across all.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10)));

  try {
    if (orderId) {
      const [notes, events] = await Promise.all([
        prisma.orderNote.findMany({
          where: { orderId },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            createdAt: true,
            type: true,
            visibility: true,
            message: true,
            createdBy: true,
            orderId: true,
          },
        }),
        prisma.orderStatusEvent.findMany({
          where: { orderId },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            createdAt: true,
            status: true,
            provider: true,
            orderId: true,
          },
        }),
      ]);

      const activities = [
        ...notes.map((n) => ({
          id: `note-${n.id}`,
          type: "note" as const,
          createdAt: n.createdAt.toISOString(),
          orderId: n.orderId,
          data: { type: n.type, visibility: n.visibility, message: n.message, createdBy: n.createdBy },
        })),
        ...events.map((e) => ({
          id: `event-${e.id}`,
          type: "status" as const,
          createdAt: e.createdAt.toISOString(),
          orderId: e.orderId,
          data: { status: e.status, provider: e.provider },
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({ activities: activities.slice(0, limit) });
    }

    const [recentNotes, recentEvents] = await Promise.all([
      prisma.orderNote.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          type: true,
          message: true,
          createdBy: true,
          orderId: true,
        },
      }),
      prisma.orderStatusEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          status: true,
          provider: true,
          orderId: true,
        },
      }),
    ]);

    const activities = [
      ...recentNotes.map((n) => ({
        id: `note-${n.id}`,
        type: "note" as const,
        createdAt: n.createdAt.toISOString(),
        orderId: n.orderId,
        data: { type: n.type, message: n.message, createdBy: n.createdBy },
      })),
      ...recentEvents.map((e) => ({
        id: `event-${e.id}`,
        type: "status" as const,
        createdAt: e.createdAt.toISOString(),
        orderId: e.orderId,
        data: { status: e.status, provider: e.provider },
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ activities: activities.slice(0, limit) });
  } catch (err) {
    console.error("[admin/orders/activities] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
