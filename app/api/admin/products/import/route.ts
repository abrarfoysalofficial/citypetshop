import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const rowSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
  categorySlug: z.string().min(1),
  image: z.string().optional(),
  inStock: z.boolean().optional().default(true),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 100);
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function parseRow(row: Record<string, string>): z.infer<typeof rowSchema> | null {
  const name = (row.name ?? row.Name ?? "").trim();
  const price = parseInt((row.price ?? row.Price ?? "0").trim(), 10);
  const categorySlug = (row.categoryslug ?? row.category_slug ?? row.categorySlug ?? "").trim();
  if (!name || Number.isNaN(price) || price < 0 || !categorySlug) return null;
  const inStock = (row.instock ?? row.inStock ?? "true").trim().toLowerCase() !== "false";
  return {
    name,
    price,
    description: (row.description ?? "").trim() || name,
    categorySlug,
    image: (row.image ?? "").trim() || undefined,
    inStock,
  };
}

/** POST: Bulk import products from CSV (text) or JSON */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let rows: z.infer<typeof rowSchema>[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const items = Array.isArray(body.products) ? body.products : Array.isArray(body) ? body : [];
      for (const item of items) {
        const parsed = rowSchema.safeParse({
          name: item.name ?? item.nameEn,
          price: typeof item.price === "number" ? item.price : parseFloat(item.price ?? "0") || 0,
          description: item.description ?? item.descriptionEn,
          categorySlug: item.categorySlug ?? item.category_slug,
          image: item.image ?? item.imageUrl,
          inStock: item.inStock ?? item.in_stock !== false,
        });
        if (parsed.success) rows.push(parsed.data);
      }
    } else if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const text = await request.text();
      const csvRows = parseCSV(text);
      for (const r of csvRows) {
        const p = parseRow(r);
        if (p) rows.push(p);
      }
    } else {
      return NextResponse.json(
        { error: "Content-Type must be application/json or text/csv" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows to import" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({ select: { slug: true } });
    const validSlugs = new Set(categories.map((c) => c.slug));

    let created = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!validSlugs.has(row.categorySlug)) {
        errors.push(`Row ${i + 1}: Invalid category "${row.categorySlug}"`);
        continue;
      }

      const baseSlug = slugify(row.name);
      let slug = baseSlug;
      let suffix = 0;
      while (slug) {
        const exists = await prisma.product.findUnique({ where: { slug } });
        if (!exists) break;
        suffix++;
        slug = `${baseSlug}-${suffix}`;
      }

      try {
        const product = await prisma.product.create({
          data: {
            nameEn: row.name,
            slug,
            descriptionEn: row.description ?? row.name,
            sellingPrice: row.price,
            buyingPrice: 0,
            stock: row.inStock ? 1 : 0,
            categorySlug: row.categorySlug,
            isActive: true,
            isFeatured: false,
          },
        });

        if (row.image) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: row.image,
              sortOrder: 0,
              isPrimary: true,
            },
          });
        }

        created++;
        await logAdminAction(auth.userId, "create", "product", product.id, undefined, { nameEn: product.nameEn, slug: product.slug }, { headers: request.headers });
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : "Failed"}`);
      }
    }

    return NextResponse.json({
      created,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[admin/products/import] POST:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
