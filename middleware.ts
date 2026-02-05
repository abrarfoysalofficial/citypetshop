import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const AUTH_MODE =
  (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ??
  (process.env.NODE_ENV === "production" ? "supabase" : "demo");

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // DEV-only routes: 404 in production
  if (pathname.startsWith("/dev/") && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Supabase mode: refresh session and protect /admin, /account
  if (AUTH_MODE === "supabase") {
    const response = NextResponse.next();
    const supabase = createMiddlewareClient(request, response);
    if (supabase) {
      await supabase.auth.getUser(); // Refreshes session, updates cookies via setAll
    }

    // Login pages: allow always
    if (pathname === "/admin/login" || pathname === "/login" || pathname.startsWith("/auth/")) {
      return response;
    }

    // Protected routes: require Supabase session
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (pathname.startsWith("/admin/") || pathname === "/admin") {
        if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
        // TODO: Check team_members for admin role when DB connected
      }
      if (pathname.startsWith("/account/") || pathname === "/account") {
        if (!user) return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    return response;
  }

  // Demo mode: use demo_session cookie
  const session = request.cookies.get("demo_session")?.value;

  if (pathname === "/admin/login" || pathname === "/login") {
    if (session === "admin" && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if ((session === "user" || session === "admin") && pathname === "/login") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/") || pathname === "/admin") {
    if (session !== "admin") return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/account/") || pathname === "/account") {
    if (session !== "user" && session !== "admin") return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/auth/:path*",
    "/dev/:path*",
  ],
};
