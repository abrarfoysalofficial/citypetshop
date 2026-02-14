import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * GET /api/admin/products
 * Fetch all products (admin view)
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch products:", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("products GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 * Body: ProductRow (without id, created_at, updated_at)
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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
      console.error("Failed to create product:", error);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("products POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products
 * Update a product
 * Body: { id: string, ...updates }
 */
export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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
      console.error("Failed to update product:", error);
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("products PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products
 * Delete a product
 * Body: { id: string }
 */
export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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
      console.error("Failed to delete product:", error);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("products DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
