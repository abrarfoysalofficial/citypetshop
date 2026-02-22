import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPrismaConfigured } from "@/src/config/env";

export const dynamic = "force-dynamic";

/**
 * Phase 8: Server-side pixel events.
 * POST body: { event_name, event_id?, user_data?, custom_data? }
 * Forwards to Facebook CAPI and GA4 Measurement Protocol when configured.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const eventName = body.event_name as string;
  const eventId = body.event_id as string | undefined;
  const userData = body.user_data as Record<string, string> | undefined;
  const customData = body.custom_data as Record<string, unknown> | undefined;

  if (!eventName) return NextResponse.json({ error: "event_name required" }, { status: 400 });

  const results: { meta?: string; ga4?: string } = {};

  // Store in analytics_events when Prisma is configured
  if (isPrismaConfigured()) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName,
          eventId: eventId ?? undefined,
          source: "server",
          payloadSummary: { userData, customData } as object,
        },
      });
    } catch {
      // Non-blocking
    }
  }

  // Facebook CAPI
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const capiToken = process.env.FACEBOOK_CAPI_TOKEN;
  if (pixelId && capiToken) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${capiToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [
              {
                event_name: eventName,
                event_id: eventId,
                user_data: userData ? { em: userData.email_hash, ph: userData.phone_hash } : undefined,
                custom_data: customData,
              },
            ],
          }),
        }
      );
      results.meta = res.ok ? "sent" : `error:${res.status}`;
    } catch (e) {
      results.meta = "error";
    }
  }

  // GA4 Measurement Protocol
  const ga4Id = process.env.GA4_MEASUREMENT_ID;
  const ga4Secret = process.env.GA4_MEASUREMENT_SECRET;
  if (ga4Id && ga4Secret) {
    try {
      const res = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${ga4Id}&api_secret=${ga4Secret}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: userData?.client_id ?? "server",
            events: [{ name: eventName, params: customData ?? {} }],
          }),
        }
      );
      results.ga4 = res.ok ? "sent" : `error:${res.status}`;
    } catch {
      results.ga4 = "error";
    }
  }

  return NextResponse.json({ ok: true, results });
}
