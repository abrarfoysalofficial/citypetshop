import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set("demo_session", "", { path: "/", maxAge: 0 });
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore if Supabase not configured or signOut fails
  }
  return res;
}
