/**
 * GET  /api/admin/units — list all units (sizes, weights, rams)
 * POST /api/admin/units — create unit
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const unitTypes = ["size", "weight", "ram"] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const type = request.nextUrl.searchParams.get("type") as (typeof unitTypes)[number] | null;

  try {
    const [sizes, weights, rams] = await Promise.all([
      !type || type === "size" ? prisma.productSize.findMany({ orderBy: { sortOrder: "asc" } }) : [],
      !type || type === "weight" ? prisma.productWeight.findMany({ orderBy: { sortOrder: "asc" } }) : [],
      !type || type === "ram" ? prisma.productRam.findMany({ orderBy: { sortOrder: "asc" } }) : [],
    ]);

    return NextResponse.json({
      sizes: sizes.map((s) => ({ ...s, _type: "size" })),
      weights: weights.map((w) => ({ ...w, _type: "weight" })),
      rams: rams.map((r) => ({ ...r, _type: "ram" })),
    });
  } catch (err) {
    console.error("[admin/units] GET:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

const createSchema = z.object({
  type: z.enum(unitTypes),
  value: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, value, sortOrder, isActive } = parsed.data;

  try {
    if (type === "size") {
      const created = await prisma.productSize.create({
        data: { value, sortOrder, isActive },
      });
      return NextResponse.json({ ...created, _type: "size" }, { status: 201 });
    }
    if (type === "weight") {
      const created = await prisma.productWeight.create({
        data: { value, sortOrder, isActive },
      });
      return NextResponse.json({ ...created, _type: "weight" }, { status: 201 });
    }
    const created = await prisma.productRam.create({
      data: { value, sortOrder, isActive },
    });
    return NextResponse.json({ ...created, _type: "ram" }, { status: 201 });
  } catch (err) {
    console.error("[admin/units] POST:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
