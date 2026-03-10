import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";
import { logAdminAction } from "@lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const tenantId = getDefaultTenantId();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    const where: { tenantId: string; deletedAt: null; parentId?: string | null } = { tenantId, deletedAt: null };
    if (parentId !== undefined && parentId !== null && parentId !== "") {
      where.parentId = parentId === "root" ? null : parentId;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, nameEn: true, nameBn: true } },
        children: { select: { id: true, nameEn: true, nameBn: true } },
        _count: { select: { products: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[admin/categories] GET:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = await request.json();

    if (!body.nameEn || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const tenantId = getDefaultTenantId();
    const category = await prisma.category.create({
      data: {
        tenantId,
        nameEn: body.nameEn,
        nameBn: body.nameBn,
        slug: body.slug,
        descriptionEn: body.descriptionEn,
        descriptionBn: body.descriptionBn,
        imageUrl: body.imageUrl,
        parentId: body.parentId,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== false
      },
      include: {
        parent: { select: { nameEn: true, nameBn: true } }
      }
    });

    await logAdminAction(auth.userId, "create", "category", category.id, undefined, { nameEn: category.nameEn, slug: category.slug }, { headers: request.headers });

    revalidatePath("/");

    return NextResponse.json(category);
  } catch (error) {
    console.error("[admin/categories] POST:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const tenantId = getDefaultTenantId();
    const before = await prisma.category.findFirst({ where: { id, tenantId } });
    if (!before) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const category = await prisma.category.update({
      where: { id },
      data: {
        nameEn: updates.nameEn,
        nameBn: updates.nameBn,
        slug: updates.slug,
        descriptionEn: updates.descriptionEn,
        descriptionBn: updates.descriptionBn,
        imageUrl: updates.imageUrl,
        parentId: updates.parentId,
        sortOrder: updates.sortOrder,
        isActive: updates.isActive
      },
      include: {
        parent: { select: { nameEn: true, nameBn: true } }
      }
    });

    await logAdminAction(auth.userId, "update", "category", id, before, category, { headers: request.headers });

    revalidatePath("/");

    return NextResponse.json(category);
  } catch (error) {
    console.error("[admin/categories] PATCH:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const tenantId = getDefaultTenantId();
    const before = await prisma.category.findFirst({ where: { id, tenantId } });
    if (!before) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
    await logAdminAction(auth.userId, "delete", "category", id, before, undefined, { headers: request.headers });

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/categories] DELETE:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
