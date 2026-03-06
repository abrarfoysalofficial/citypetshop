import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/analytics/live - Live visitor count + page traffic */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [liveCount, visitors, recentEvents] = await Promise.all([
    prisma.liveVisitor.count({
      where: { lastSeen: { gte: fiveMinutesAgo } },
    }),
    prisma.liveVisitor.findMany({
      where: { lastSeen: { gte: fiveMinutesAgo } },
      select: { pageUrl: true, lastSeen: true },
      take: 50,
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { eventName: true, pageUrl: true, createdAt: true },
    }),
  ]);

  const pageCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    const url = v.pageUrl || "/";
    pageCounts[url] = (pageCounts[url] ?? 0) + 1;
  });

  return NextResponse.json({
    liveVisitorCount: liveCount,
    pageTraffic: pageCounts,
    recentEvents: recentEvents.map((e) => ({
      event: e.eventName,
      page: e.pageUrl,
      at: e.createdAt.toISOString(),
    })),
  });
}
