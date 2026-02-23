import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const layoutSchema = z.array(z.object({ id: z.string(), visible: z.boolean().optional() }));

const defaultLayout = [
  { id: "sales", visible: true },
  { id: "profit", visible: true },
  { id: "orders", visible: true },
  { id: "returnRate", visible: true },
  { id: "loss", visible: true },
];

/** GET: Load dashboard layout. Stored in SiteSettings advancedSettings. */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const adv = (s?.advancedSettings ?? {}) as { dashboard_layout?: unknown };
    const layout = adv.dashboard_layout;
    if (Array.isArray(layout) && layout.length > 0) {
      return NextResponse.json({ layout });
    }
  } catch {
    // Fallback to default
  }
  return NextResponse.json({ layout: defaultLayout });
}

/** PATCH: Save dashboard layout. */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = layoutSchema.safeParse(body.layout ?? body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
  }
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const adv = (s?.advancedSettings ?? {}) as Record<string, unknown>;
    adv.dashboard_layout = parsed.data;
    const jsonAdv = adv as Prisma.InputJsonValue;
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", advancedSettings: jsonAdv },
      update: { advancedSettings: jsonAdv },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[dashboard-layout] PATCH error:", err);
    return NextResponse.json({ error: "Failed to save layout" }, { status: 500 });
  }
}
