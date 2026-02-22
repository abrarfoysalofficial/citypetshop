import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuthAndPermission, requireAdminAuth } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/** GET: List products with optional search, category filter, pagination */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuthAndPermission("products.view");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 500);
  const offset = (page - 1) * limit;

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== "all") {
      where.categorySlug = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { nameEn: true, nameBn: true } },
          brand: { select: { name: true } },
          variants: { select: { id: true, sku: true, stock: true, price: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          tags: { include: { tag: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error("[admin/products] GET:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

/** POST: Create product */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.nameEn || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        nameEn: body.nameEn,
        nameBn: body.nameBn,
        slug: body.slug,
        descriptionEn: body.descriptionEn,
        descriptionBn: body.descriptionBn,
        buyingPrice: body.buyingPrice ? parseFloat(body.buyingPrice) : 0,
        sellingPrice: parseFloat(body.sellingPrice),
        stock: parseInt(body.stock) || 0,
        weightKg: body.weightKg ? parseFloat(body.weightKg) : null,
        sku: body.sku,
        categorySlug: body.categorySlug,
        categoryId: body.categoryId,
        isFeatured: body.isFeatured || false,
        isActive: body.isActive !== false,
        brandId: body.brandId,
        rating: body.rating ? parseFloat(body.rating) : null,
        discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : null,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoTags: body.seoTags || [],
        metaOgImage: body.metaOgImage
      },
      include: {
        category: { select: { nameEn: true, nameBn: true } },
        brand: { select: { name: true } }
      }
    });

    await logAdminAction(auth.userId, "create", "product", product.id, undefined, { nameEn: product.nameEn, slug: product.slug }, { headers: request.headers });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[admin/products] POST:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

/** PATCH: Update product */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(updates.nameEn !== undefined && { nameEn: updates.nameEn }),
        ...(updates.nameBn !== undefined && { nameBn: updates.nameBn }),
        ...(updates.slug !== undefined && { slug: updates.slug }),
        ...(updates.descriptionEn !== undefined && { descriptionEn: updates.descriptionEn }),
        ...(updates.sellingPrice !== undefined && { sellingPrice: updates.sellingPrice }),
        ...(updates.buyingPrice !== undefined && { buyingPrice: updates.buyingPrice }),
        ...(updates.stock !== undefined && { stock: updates.stock }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
        ...(updates.isFeatured !== undefined && { isFeatured: updates.isFeatured }),
        ...(updates.categorySlug !== undefined && { categorySlug: updates.categorySlug }),
      },
    });

    await logAdminAction(auth.userId, "update", "product", id, before, product, { headers: request.headers });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[admin/products] PATCH:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/** DELETE: Delete product */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    await logAdminAction(auth.userId, "delete", "product", id, before, undefined, { headers: request.headers });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/products] DELETE:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
