import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { isPrismaConfigured } from "@/src/config/env";
import { rateLimit, getRateLimitKey } from "@lib/rate-limit";
import { assertBodySize } from "@lib/request-utils";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANALYTICS_REQUESTS_PER_MIN = 60;
const BODY_LIMIT_BYTES = 64 * 1024; // 64KB

const schema = z.object({
  event_name: z.string().min(1),
  event_id: z.string().optional(),
  source: z.enum(["browser", "server"]).default("browser"),
  page_url: z.string().optional(),
  referrer: z.string().optional(),
  session_id: z.string().optional(),
  payload_summary: z.record(z.unknown()).optional(),
  has_email_hash: z.boolean().optional(),
  has_phone_hash: z.boolean().optional(),
  has_fbp: z.boolean().optional(),
  has_fbc: z.boolean().optional(),
});

/** POST: Capture analytics event. Dedup by event_id if provided. Rate limited 60 req/min per IP. */
export async function POST(request: NextRequest) {
  const rl = await rateLimit(
    getRateLimitKey("analytics:events", request),
    ANALYTICS_REQUESTS_PER_MIN,
    60 * 1000
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  const sizeCheck = assertBodySize(request, BODY_LIMIT_BYTES);
  if (sizeCheck) return sizeCheck;

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isPrismaConfigured()) {
    return NextResponse.json({ ok: true });
  }
  if (parsed.data.event_id) {
    const existing = await prisma.analyticsEvent.findUnique({
      where: { eventId: parsed.data.event_id },
    });
    if (existing) return NextResponse.json({ ok: true, deduped: true });
  }
  await prisma.analyticsEvent.create({
    data: {
      eventName: parsed.data.event_name,
      eventId: parsed.data.event_id ?? undefined,
      source: parsed.data.source,
      pageUrl: parsed.data.page_url ?? undefined,
      referrer: parsed.data.referrer ?? undefined,
      sessionId: parsed.data.session_id ?? undefined,
      payloadSummary: (parsed.data.payload_summary as object) ?? undefined,
    },
  });
  return NextResponse.json({ ok: true });
}
