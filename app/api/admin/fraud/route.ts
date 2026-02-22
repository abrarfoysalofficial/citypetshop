import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { blockIp } from "@/lib/fraud";

export const dynamic = "force-dynamic";

/** GET: List fraud flags and blocked IPs */
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // flags | blocked | both

  const [flags, blocked] = await Promise.all([
    type === "blocked" ? [] : prisma.fraudFlag.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    type === "flags" ? [] : prisma.blockedIp.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    flags: flags.map((f) => ({
      id: f.id,
      orderId: f.orderId,
      flagType: f.flagType,
      score: f.score,
      details: f.detailsJson,
      createdAt: f.createdAt.toISOString(),
    })),
    blockedIps: blocked.map((b) => ({
      id: b.id,
      ip: b.ip,
      reason: b.reason,
      expiresAt: b.expiresAt?.toISOString() ?? null,
      createdAt: b.createdAt.toISOString(),
    })),
  });
}

/** POST: Block an IP */
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const ip = (body.ip as string)?.trim();
  const reason = (body.reason as string)?.trim() || "Manual block";
  const expiresHours = typeof body.expiresHours === "number" ? body.expiresHours : null;

  if (!ip) return NextResponse.json({ error: "ip required" }, { status: 400 });

  const expiresAt = expiresHours ? new Date(Date.now() + expiresHours * 60 * 60 * 1000) : undefined;
  await blockIp(ip, reason, expiresAt);
  return NextResponse.json({ ok: true });
}
