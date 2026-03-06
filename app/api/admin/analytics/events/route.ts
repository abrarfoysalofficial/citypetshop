import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";

export const dynamic = "force-dynamic";

const META_EVENT_NAMES = ["ViewContent", "Search", "AddToCart", "InitiateCheckout", "AddPaymentInfo", "Purchase"];

/** GET: Fetch analytics events. */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const event = searchParams.get("event");
  const source = searchParams.get("source");

  try {
    const where: Prisma.AnalyticsEventWhereInput = {};
    const createdAt: { gte?: Date; lte?: Date } = {};
    if (from) createdAt.gte = new Date(from);
    if (to) createdAt.lte = new Date(to);
    if (Object.keys(createdAt).length) where.createdAt = createdAt;
    if (event) where.eventName = event;
    if (source) where.source = source;

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const counts: Record<string, number> = {};
    const lastReceivedByEvent: Record<string, string> = {};

    events.forEach(e => {
      counts[e.eventName] = (counts[e.eventName] || 0) + 1;
      if (!lastReceivedByEvent[e.eventName] || e.createdAt > new Date(lastReceivedByEvent[e.eventName])) {
        lastReceivedByEvent[e.eventName] = e.createdAt.toISOString();
      }
    });

    return NextResponse.json({
      events: events.map(e => ({
        id: e.id,
        event_name: e.eventName,
        event_id: e.eventId,
        source: e.source,
        page_url: e.pageUrl,
        referrer: e.referrer,
        user_id: e.userId,
        payload_summary: e.payloadSummary,
        created_at: e.createdAt.toISOString(),
        has_email_hash: false,
        has_phone_hash: false,
        has_fbp: false,
        has_fbc: false,
      })),
      counts,
      lastReceivedByEvent,
      diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: [] },
      metaEventNames: META_EVENT_NAMES,
    });
  } catch (err) {
    console.error("[api/admin/analytics/events] error:", err);
    return NextResponse.json({
      events: [],
      counts: {},
      lastReceivedByEvent: {},
      diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: ["Failed to load analytics"] },
      metaEventNames: META_EVENT_NAMES,
    });
  }
}
