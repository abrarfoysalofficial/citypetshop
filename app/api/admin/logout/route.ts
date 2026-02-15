/**
 * GET /api/admin/logout
 * Sign out from Supabase Auth and redirect to admin login.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/admin/login";
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore if Supabase not configured or signOut fails
  }
  return NextResponse.redirect(new URL(next, request.url));
}
