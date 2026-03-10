import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuthAndPermission, requireAdminAuth } from "@lib/admin-auth";
import { logAdminAction } from "@lib/rbac";
import { buildProductRoute } from "@/lib/storefront-routes";

export const dynamic = "force-dynamic";

function revalidateProductRoute(categorySlug: string | null | undefined, slug: string | null | undefined, id: string) {
  revalidatePath(
    buildProductRoute({
      categorySlug: categorySlug ?? "general",
      subcategorySlug: categorySlug ?? "general",
      slug: slug ?? id,
      id,
    })
  );
}

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
    const tenantId = getDefaultTenantId();
    const where: Prisma.ProductWhereInput = {
      tenantId,
      deletedAt: null,
    };

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
          images: { select: { url: true, isPrimary: true }, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
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

    const slugStr = String(body.slug).trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugStr)) {
      return NextResponse.json(
        { error: "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-product)" },
        { status: 400 }
      );
    }

    const sellingPrice = parseFloat(body.sellingPrice);
    if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
      return NextResponse.json({ error: "Valid selling price (≥ 0) is required" }, { status: 400 });
    }

    const stock = parseInt(body.stock, 10);
    if (Number.isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock must be a non-negative integer" }, { status: 400 });
    }

    const discountPercent = body.discountPercent != null ? parseFloat(body.discountPercent) : null;
    if (discountPercent != null && (Number.isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
      return NextResponse.json({ error: "Discount percent must be between 0 and 100" }, { status: 400 });
    }

    const buyingPrice = body.buyingPrice != null ? parseFloat(body.buyingPrice) : 0;
    if (Number.isNaN(buyingPrice) || buyingPrice < 0) {
      return NextResponse.json({ error: "Buying price must be ≥ 0" }, { status: 400 });
    }

    const tenantId = getDefaultTenantId();

    const existingSlug = await prisma.product.findFirst({
      where: { tenantId, slug: slugStr, deletedAt: null },
      select: { id: true },
    });
    if (existingSlug) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }

    const category = body.categorySlug
      ? await prisma.category.findFirst({
          where: { tenantId, slug: body.categorySlug, deletedAt: null },
          select: { id: true },
        })
      : null;

    const product = await prisma.product.create({
      data: {
        tenantId,
        nameEn: body.nameEn,
        nameBn: body.nameBn,
        slug: slugStr,
        descriptionEn: body.descriptionEn,
        descriptionBn: body.descriptionBn,
        buyingPrice,
        sellingPrice,
        stock,
        weightKg: body.weightKg ? parseFloat(body.weightKg) : null,
        sku: body.sku,
        categorySlug: body.categorySlug,
        categoryId: category?.id ?? body.categoryId,
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

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${product.categorySlug}`);
    revalidateProductRoute(product.categorySlug, product.slug, product.id);

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
    const tenantId = getDefaultTenantId();
    const before = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!before) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (updates.nameEn !== undefined) data.nameEn = updates.nameEn;
    if (updates.nameBn !== undefined) data.nameBn = updates.nameBn;
    if (updates.slug !== undefined) {
      const slugStr = String(updates.slug).trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugStr)) {
        return NextResponse.json(
          { error: "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-product)" },
          { status: 400 }
        );
      }
      const existingSlug = await prisma.product.findFirst({
        where: { tenantId, slug: slugStr, deletedAt: null, id: { not: id } },
        select: { id: true },
      });
      if (existingSlug) {
        return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
      }
      data.slug = slugStr;
    }
    if (updates.descriptionEn !== undefined) data.descriptionEn = updates.descriptionEn;
    if (updates.sellingPrice !== undefined) {
      const v = parseFloat(updates.sellingPrice);
      if (Number.isNaN(v) || v < 0) {
        return NextResponse.json({ error: "Selling price must be ≥ 0" }, { status: 400 });
      }
      data.sellingPrice = v;
    }
    if (updates.buyingPrice !== undefined) {
      const v = parseFloat(updates.buyingPrice);
      if (Number.isNaN(v) || v < 0) {
        return NextResponse.json({ error: "Buying price must be ≥ 0" }, { status: 400 });
      }
      data.buyingPrice = v;
    }
    if (updates.stock !== undefined) {
      const v = parseInt(String(updates.stock), 10);
      if (Number.isNaN(v) || v < 0) {
        return NextResponse.json({ error: "Stock must be a non-negative integer" }, { status: 400 });
      }
      data.stock = v;
    }
    if (updates.discountPercent !== undefined) {
      const v = updates.discountPercent == null ? null : parseFloat(updates.discountPercent);
      if (v != null && (Number.isNaN(v) || v < 0 || v > 100)) {
        return NextResponse.json({ error: "Discount percent must be between 0 and 100" }, { status: 400 });
      }
      data.discountPercent = v;
    }
    if (updates.isActive !== undefined) data.isActive = updates.isActive;
    if (updates.isFeatured !== undefined) data.isFeatured = updates.isFeatured;
    if (updates.categorySlug !== undefined) {
      data.categorySlug = updates.categorySlug;
      const category = await prisma.category.findFirst({
        where: { tenantId, slug: updates.categorySlug, deletedAt: null },
        select: { id: true },
      });
      data.categoryId = category?.id ?? null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: data as Prisma.ProductUpdateInput,
    });

    await logAdminAction(auth.userId, "update", "product", id, before, product, { headers: request.headers });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${before.categorySlug}`);
    revalidatePath(`/category/${product.categorySlug}`);
    revalidateProductRoute(before.categorySlug, before.slug, id);
    revalidateProductRoute(product.categorySlug, product.slug, id);

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
    const tenantId = getDefaultTenantId();
    const before = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!before) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
    await logAdminAction(auth.userId, "delete", "product", id, before, undefined, { headers: request.headers });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${before.categorySlug}`);
    revalidateProductRoute(before.categorySlug, before.slug, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/products] DELETE:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
