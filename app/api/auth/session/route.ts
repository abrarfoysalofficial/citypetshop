import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AUTH_MODE } from "@/src/config/runtime";

export const dynamic = "force-dynamic";

/** Returns session status for client-side auth checks (demo or Supabase). */
export async function GET(request: NextRequest) {
  if (AUTH_MODE === "demo") {
    const session = request.cookies.get("demo_session")?.value;
    const isLoggedIn = session === "user" || session === "admin";
    return NextResponse.json({ isLoggedIn, session: isLoggedIn ? session : null });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({
    isLoggedIn: !!user,
    session: user ? { id: user.id, email: user.email } : null,
  });
}
