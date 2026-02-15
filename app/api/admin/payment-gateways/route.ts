import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { DEMO_PAYMENT_GATEWAYS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payment-gateways
 * Admin: Supabase only. Falls back to defaults if table empty.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("*")
      .order("gateway", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEMO_PAYMENT_GATEWAYS);
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/payment-gateways] GET error:", err);
    return NextResponse.json(DEMO_PAYMENT_GATEWAYS);
  }
}

/**
 * PATCH /api/admin/payment-gateways
 * Update a payment gateway. Admin Supabase only.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
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
      console.error("[api/admin/payment-gateways] PATCH error:", error.message);
      return NextResponse.json({ error: "Failed to update payment gateway" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/payment-gateways] PATCH unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
