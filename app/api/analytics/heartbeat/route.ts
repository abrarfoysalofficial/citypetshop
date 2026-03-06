import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/heartbeat
 * Client sends session heartbeat for live visitor tracking.
 * Body: { sessionId, pageUrl, referrer }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId as string;
  const pageUrl = body.pageUrl as string | undefined;
  const referrer = body.referrer as string | undefined;

  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const now = new Date();
  await prisma.liveVisitor.upsert({
    where: { sessionId },
    create: {
      sessionId,
      pageUrl: pageUrl ?? null,
      referrer: referrer ?? null,
      firstSeen: now,
      lastSeen: now,
    },
    update: {
      pageUrl: pageUrl ?? undefined,
      referrer: referrer ?? undefined,
      lastSeen: now,
    },
  });

  return NextResponse.json({ ok: true });
}
