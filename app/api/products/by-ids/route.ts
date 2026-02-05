import { NextRequest } from "next/server";
import { getProducts } from "@/src/data/provider";

/**
 * GET /api/products/by-ids?ids=1,2,3
 * Returns products whose id is in the comma-separated list. Used for recently viewed, etc.
 */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam?.trim()) {
    return Response.json({ products: [] });
  }
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    return Response.json({ products: [] });
  }
  const all = await getProducts();
  const set = new Set(ids);
  const products = all.filter((p) => set.has(p.id));
  return Response.json({ products });
}
