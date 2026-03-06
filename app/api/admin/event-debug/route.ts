import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";

export const dynamic = "force-dynamic";

const LIMIT = 50;

/** GET: Event debug — admin only. Last 50 analytics, notifications, failed webhooks. Tenant scoped. */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const tenantId = getDefaultTenantId();
  const { searchParams } = new URL(request.url);
  const eventFilter = searchParams.get("event")?.trim();
  const typeFilter = searchParams.get("type")?.trim();

  try {
    const [analyticsEvents, notificationLogs, failedNotifications, failedWebhooks] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: eventFilter ? { eventName: eventFilter } : undefined,
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        select: {
          id: true,
          eventName: true,
          eventId: true,
          source: true,
          pageUrl: true,
          createdAt: true,
          payloadSummary: true,
        },
      }),
      prisma.notificationLog.findMany({
        where: { tenantId, ...(typeFilter ? { type: typeFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        select: {
          id: true,
          type: true,
          channel: true,
          orderId: true,
          recipient: true,
          provider: true,
          messageId: true,
          createdAt: true,
        },
      }),
      prisma.notificationLog.findMany({
        where: {
          tenantId,
          provider: null,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        select: {
          id: true,
          type: true,
          channel: true,
          orderId: true,
          recipient: true,
          createdAt: true,
        },
      }),
      prisma.paymentWebhookLog.findMany({
        where: { status: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        select: {
          id: true,
          orderId: true,
          gateway: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      analyticsEvents: analyticsEvents.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        eventId: e.eventId,
        source: e.source,
        pageUrl: e.pageUrl,
        createdAt: e.createdAt.toISOString(),
        payloadSummary: e.payloadSummary,
      })),
      notificationLogs: notificationLogs.map((n) => ({
        id: n.id,
        type: n.type,
        channel: n.channel,
        orderId: n.orderId,
        recipient: n.recipient,
        provider: n.provider,
        messageId: n.messageId,
        createdAt: n.createdAt.toISOString(),
      })),
      failedNotifications: failedNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        channel: n.channel,
        orderId: n.orderId,
        recipient: n.recipient,
        createdAt: n.createdAt.toISOString(),
      })),
      failedWebhooks: failedWebhooks.map((w) => ({
        id: w.id,
        orderId: w.orderId,
        gateway: w.gateway,
        status: w.status,
        createdAt: w.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch event debug data" },
      { status: 500 }
    );
  }
}
