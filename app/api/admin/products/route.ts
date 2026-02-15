import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth, isDemoAuth } from "@/lib/admin-auth";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * GET /api/admin/products
 * Fetch all products (admin view). Returns demo data when Supabase not configured.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json(DEMO_PRODUCTS);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/admin/products] GET error:", error.message);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[api/admin/products] GET unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Create a new product. Requires Supabase.
 */
export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Demo mode: create not supported" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[api/admin/products] POST error:", error.message);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/products] POST unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products
 * Update a product. Requires Supabase.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Demo mode: update not supported" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[api/admin/products] PATCH error:", error.message);
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/products] PATCH unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products
 * Delete a product. Requires Supabase.
 */
export async function DELETE(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Demo mode: delete not supported" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[api/admin/products] DELETE error:", error.message);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/products] DELETE unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
