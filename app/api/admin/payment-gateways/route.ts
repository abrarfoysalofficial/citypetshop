import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * GET /api/admin/payment-gateways
 * Fetch all payment gateways (admin view, including credentials)
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("*")
      .order("gateway", { ascending: true });

    if (error) {
      console.error("Failed to fetch payment_gateways:", error);
      return NextResponse.json({ error: "Failed to fetch payment gateways" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("payment_gateways GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/payment-gateways
 * Update a payment gateway (toggle active, update credentials)
 * Body: { id: string, is_active?: boolean, credentials_json?: object }
 */
export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing gateway id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_gateways")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update payment_gateway:", error);
      return NextResponse.json({ error: "Failed to update payment gateway" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("payment_gateways PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
