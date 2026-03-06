import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: Export products as CSV */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") ?? "500", 10)));
  const offset = (page - 1) * limit;

  try {
    const tenantId = getDefaultTenantId();
    const products = await prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const headers = ["name", "slug", "price", "description", "categorySlug", "stock", "image", "inStock"];
    const rows = products.map((p) => [
      p.nameEn,
      p.slug,
      p.sellingPrice.toString(),
      (p.descriptionEn ?? "").replace(/"/g, '""'),
      p.categorySlug,
      p.stock.toString(),
      p.images[0]?.url ?? "",
      p.stock > 0 ? "true" : "false",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[admin/products/export] GET:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
