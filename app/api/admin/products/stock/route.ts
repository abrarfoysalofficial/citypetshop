import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth, isDemoAuth } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * PATCH /api/admin/products/stock
 * Update stock quantity for a product
 * Body: { id: string, stock: number }
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    const body = await request.json();
    return NextResponse.json({ id: body?.id, name_en: "Demo", stock: body?.stock ?? 0 });
  }

  try {
    const body = await request.json();
    const { id, stock } = body;

    if (!id || stock === undefined || stock === null) {
      return NextResponse.json({ error: "Missing id or stock value" }, { status: 400 });
    }

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Stock must be a non-negative number" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update({ stock })
      .eq("id", id)
      .select("id, name_en, stock")
      .single();

    if (error) {
      console.error("Failed to update product stock:", error);
      return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("products stock PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
