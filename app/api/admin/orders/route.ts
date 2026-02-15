/**
 * GET /api/admin/orders
 * Fetch orders from Supabase. Admin auth required.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("orders")
      .select("id, user_id, guest_email, guest_name, shipping_name, shipping_email, status, total, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/orders] GET:", error.message);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const orders = (rows ?? []).map((o: Record<string, unknown>) => ({
      id: o.id,
      customerName: (o.guest_name ?? o.shipping_name ?? "Guest") as string,
      email: (o.guest_email ?? o.shipping_email ?? "") as string,
      total: Number(o.total ?? 0),
      status: (o.status ?? "pending") as string,
      createdAt: (o.created_at ?? "") as string,
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[admin/orders] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
