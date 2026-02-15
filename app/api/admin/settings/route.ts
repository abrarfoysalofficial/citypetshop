import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { DEMO_SITE_SETTINGS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Admin: Supabase only. Fetches from site_settings; falls back to defaults for form structure.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      return NextResponse.json(DEMO_SITE_SETTINGS as Record<string, unknown>);
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/settings] GET error:", err);
    return NextResponse.json(DEMO_SITE_SETTINGS as Record<string, unknown>);
  }
}

/**
 * PATCH /api/admin/settings
 * Update site_settings. Admin Supabase only.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id: _id, updated_at: _ua, ...updates } = body;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("id", "default")
      .select()
      .single();

    if (error) {
      console.error("[api/admin/settings] PATCH error:", error.message);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/settings] PATCH unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
