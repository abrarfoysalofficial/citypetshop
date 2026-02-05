import { NextRequest, NextResponse } from "next/server";

const AUTH_MODE =
  (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ??
  (process.env.NODE_ENV === "production" ? "supabase" : "demo");

const DEMO_ADMIN = { email: "admin@cityplus.local", password: "Admin@12345" };
const DEMO_USER = { email: "user@cityplus.local", password: "User@12345" };

/** Demo login is only available when AUTH_MODE=demo. In production/Supabase mode, return 404. */
export async function POST(request: NextRequest) {
  if (AUTH_MODE !== "demo") {
    return NextResponse.json({ error: "Demo login is not available. Use Supabase Auth." }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const { email, password, type } = body as { email?: string; password?: string; type?: "admin" | "user" };

  const isAdmin = type === "admin";
  const creds = isAdmin ? DEMO_ADMIN : DEMO_USER;
  if (email !== creds.email || password !== creds.password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const value = isAdmin ? "admin" : "user";
  const redirectUrl = isAdmin ? "/admin" : "/account";
  const res = NextResponse.json({ redirect: redirectUrl });
  res.cookies.set("demo_session", value, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
