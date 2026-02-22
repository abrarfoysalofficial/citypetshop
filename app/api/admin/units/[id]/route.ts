/**
 * PATCH  /api/admin/units/[id] — update unit (type in body)
 * DELETE /api/admin/units/[id] — delete unit (type in query)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  type: z.enum(["size", "weight", "ram"]),
  value: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, value, sortOrder, isActive } = parsed.data;

  try {
    const data: { value?: string; sortOrder?: number; isActive?: boolean } = {};
    if (value !== undefined) data.value = value;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (isActive !== undefined) data.isActive = isActive;

    if (type === "size") {
      const updated = await prisma.productSize.update({
        where: { id },
        data,
      });
      return NextResponse.json({ ...updated, _type: "size" });
    }
    if (type === "weight") {
      const updated = await prisma.productWeight.update({
        where: { id },
        data,
      });
      return NextResponse.json({ ...updated, _type: "weight" });
    }
    const updated = await prisma.productRam.update({
      where: { id },
      data,
    });
    return NextResponse.json({ ...updated, _type: "ram" });
  } catch (err) {
    console.error("[admin/units] PATCH:", err);
    return NextResponse.json({ error: "Not found or invalid" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const type = request.nextUrl.searchParams.get("type") as "size" | "weight" | "ram" | null;
  if (!type || !["size", "weight", "ram"].includes(type)) {
    return NextResponse.json({ error: "Missing type (size|weight|ram)" }, { status: 400 });
  }

  try {
    if (type === "size") await prisma.productSize.delete({ where: { id } });
    else if (type === "weight") await prisma.productWeight.delete({ where: { id } });
    else await prisma.productRam.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/units] DELETE:", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
