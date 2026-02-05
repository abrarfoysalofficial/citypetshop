import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const layoutSchema = z.array(z.object({ id: z.string(), visible: z.boolean().optional() }));

/** GET: Load dashboard layout for current user/role. Returns layout_json or default order. */
export async function GET() {
  const defaultLayout = [
    { id: "sales", visible: true },
    { id: "profit", visible: true },
    { id: "orders", visible: true },
    { id: "returnRate", visible: true },
    { id: "loss", visible: true },
  ];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ layout: defaultLayout });
  }
  const supabase = await createClient();
  const defaultUserId = "00000000-0000-0000-0000-000000000000";
  const { data: row } = await supabase
    .from("dashboard_layout")
    .select("layout_json")
    .eq("user_id", defaultUserId)
    .eq("role", "admin")
    .limit(1)
    .single();
  const layout = (row as { layout_json?: unknown } | null)?.layout_json;
  if (Array.isArray(layout) && layout.length > 0) {
    return NextResponse.json({ layout });
  }
  return NextResponse.json({ layout: defaultLayout });
}

/** PATCH: Save dashboard layout (widget order + visibility). */
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = layoutSchema.safeParse(body.layout ?? body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
  }
  const layout = parsed.data;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: true });
  }
  const supabase = await createClient();
  const defaultUserId = "00000000-0000-0000-0000-000000000000";
  const { error } = await supabase.from("dashboard_layout").upsert(
    { user_id: defaultUserId, role: "admin", layout_json: layout, updated_at: new Date().toISOString() },
    { onConflict: "user_id,role" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
