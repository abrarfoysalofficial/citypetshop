/**
 * GET  /api/admin/ad-campaigns — list campaign performance
 * POST /api/admin/ad-campaigns — add campaign record
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const platform = request.nextUrl.searchParams.get("platform");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const where: { platform?: string; date?: { gte?: Date; lte?: Date } } = {};
  if (platform) where.platform = platform;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const campaigns = await prisma.campaignPerformance.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json(campaigns);
}

const createSchema = z.object({
  platform: z.enum(["meta", "tiktok", "google"]),
  campaignId: z.string().optional(),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  spend: z.number().min(0).default(0),
  revenue: z.number().min(0).default(0),
  conversions: z.number().int().min(0).default(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const campaign = await prisma.campaignPerformance.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
    },
  });
  return NextResponse.json(campaign, { status: 201 });
}
