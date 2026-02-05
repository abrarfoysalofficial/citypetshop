import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET: List notes for an order (admin). */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ notes: [] });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ notes: [] });
  }
  const supabase = await createClient();
  const { data } = await supabase.from("order_notes").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
  return NextResponse.json({ notes: data || [] });
}

/** POST: Add an order note (admin). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { orderId, type, visibility, message } = body as { orderId?: string; type?: string; visibility?: string; message?: string };
  if (!orderId || !message?.trim()) {
    return NextResponse.json({ error: "orderId and message required" }, { status: 400 });
  }
  const noteType = ["admin", "courier", "system"].includes(type || "") ? type : "admin";
  const vis = visibility === "public" ? "public" : "internal";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_notes")
    .insert({ order_id: orderId, type: noteType, visibility: vis, message: message.trim(), created_by: "admin" })
    .select("id, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id, created_at: data?.created_at });
}
