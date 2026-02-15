import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth, isDemoAuth } from "@/lib/admin-auth";
import { DEMO_SITE_SETTINGS } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * GET /api/admin/settings
 * Fetch site_settings row. Returns demo data when Supabase not configured.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json(DEMO_SITE_SETTINGS);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error) {
      console.error("[api/admin/settings] GET error:", error.message);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    return NextResponse.json(data ?? DEMO_SITE_SETTINGS);
  } catch (err) {
    console.error("[api/admin/settings] GET unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/settings
 * Update site_settings. Requires Supabase.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Demo mode: save not supported" }, { status: 400 });
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
