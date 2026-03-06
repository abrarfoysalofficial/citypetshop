import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";

export const dynamic = "force-dynamic";

/**
 * Public API: GET /api/categories
 * Returns active categories for search dropdown, shop filters, etc.
 */
export async function GET() {
  try {
    const tenantId = getDefaultTenantId();
    const categories = await prisma.category.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      select: { id: true, slug: true, nameEn: true, nameBn: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.nameEn,
        nameBn: c.nameBn,
      }))
    );
  } catch (error) {
    console.error("[api/categories] GET:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
