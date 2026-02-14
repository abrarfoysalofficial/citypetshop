import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";

/**
 * GET /api/admin/settings
 * Fetch site_settings row (id='default')
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error) {
      console.error("Failed to fetch site_settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("site_settings GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/settings
 * Update site_settings row (id='default')
 * Body: Partial<SiteSettingsRow>
 */
export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const supabase = await createClient();

    // Remove id and updated_at from body if present (managed by DB)
    const { id, updated_at, ...updates } = body;

    const { data, error } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("id", "default")
      .select()
      .single();

    if (error) {
      console.error("Failed to update site_settings:", error);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("site_settings PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
