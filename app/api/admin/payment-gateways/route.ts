import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth, isDemoAuth } from "@/lib/admin-auth";
import { getAdminPaymentGateways } from "@/src/data/provider";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * GET /api/admin/payment-gateways
 * Branches through provider; no Supabase in demo mode.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const gateways = await getAdminPaymentGateways();
    return NextResponse.json(gateways);
  } catch (err) {
    console.error("[api/admin/payment-gateways] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch payment gateways" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/payment-gateways
 * Update a payment gateway. Requires Supabase.
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
