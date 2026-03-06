import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lib/db";
import { requireAdminAuthAndPermission } from "@lib/admin-auth";
import { logAdminAction } from "@lib/rbac";

export const dynamic = "force-dynamic";

const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens only"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

const updateBrandSchema = createBrandSchema.partial();

/** GET: List brands */
export async function GET() {
  const auth = await requireAdminAuthAndPermission("brands.view");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("[admin/brands] GET:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

/** POST: Create brand */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuthAndPermission("brands.create");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  try {
    const body = await request.json();
    const parsed = createBrandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors ? Object.values(parsed.error.flatten().fieldErrors).flat().join("; ") : "Validation failed" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const slug = data.slug.toLowerCase().trim().replace(/\s+/g, "-");

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A brand with this slug already exists" }, { status: 409 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        logoUrl: data.logoUrl && data.logoUrl !== "" ? data.logoUrl : null,
        isActive: data.isActive,
      },
    });

    await logAdminAction(auth.userId, "create", "brand", brand.id, undefined, brand, { headers: request.headers });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("[admin/brands] POST:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
