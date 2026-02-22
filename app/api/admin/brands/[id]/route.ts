import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminAuthAndPermission } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const updateBrandSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

/** PATCH: Update brand */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuthAndPermission("brands.edit");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing brand id" }, { status: 400 });

  try {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateBrandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors ? Object.values(parsed.error.flatten().fieldErrors).flat().join("; ") : "Validation failed" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
    if (parsed.data.slug !== undefined) updates.slug = parsed.data.slug.toLowerCase().trim().replace(/\s+/g, "-");
    if (parsed.data.description !== undefined) updates.description = parsed.data.description?.trim() || null;
    if (parsed.data.logoUrl !== undefined) updates.logoUrl = parsed.data.logoUrl && parsed.data.logoUrl !== "" ? parsed.data.logoUrl : null;
    if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;

    if ((updates.slug as string) && (updates.slug as string) !== existing.slug) {
      const conflict = await prisma.brand.findUnique({ where: { slug: updates.slug as string } });
      if (conflict) return NextResponse.json({ error: "A brand with this slug already exists" }, { status: 409 });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updates,
    });

    await logAdminAction(auth.userId, "update", "brand", id, existing, brand, { headers: request.headers });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("[admin/brands] PATCH:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

/** DELETE: Delete brand */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuthAndPermission("brands.delete");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing brand id" }, { status: 400 });

  try {
    const existing = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${existing._count.products} product(s) use this brand. Unassign them first.` },
        { status: 409 }
      );
    }

    await prisma.brand.delete({ where: { id } });
    await logAdminAction(auth.userId, "delete", "brand", id, existing, undefined, { headers: _request.headers });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/brands] DELETE:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
