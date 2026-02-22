import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/rate-limit";

const AUTH_MODE =
  (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase" | "prisma") ??
  (process.env.NEXT_PUBLIC_AUTH_SOURCE as "demo" | "supabase" | "prisma") ??
  (process.env.NODE_ENV === "production" && process.env.DATABASE_URL ? "prisma" : "demo");

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit admin login attempts (POST to NextAuth callback)
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const ip = getClientIp(request);
    const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000); // 5 per 15 min
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
      );
    }
  }

  // Production: never allow demo mode
  if (process.env.NODE_ENV === "production" && AUTH_MODE === "demo") {
    return NextResponse.redirect(new URL("/503", request.url));
  }

  // DEV-only routes: 404 in production
  if (pathname.startsWith("/dev/") && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Prisma mode: NextAuth JWT
  if (AUTH_MODE === "prisma") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isLoggedIn = !!token;

    const adminRoles = ["admin", "adm", "super_admin"];
    if (pathname === "/admin/login" || pathname === "/login" || pathname.startsWith("/auth/")) {
      if (token && (token as { role?: string }).role && adminRoles.includes((token as { role?: string }).role ?? "")) {
        if (pathname === "/admin/login") return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (isLoggedIn && pathname === "/login") return NextResponse.redirect(new URL("/account", request.url));
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      const isAdmin = token && adminRoles.includes((token as { role?: string }).role ?? "");
      if (!isAdmin) return NextResponse.redirect(new URL("/admin/login", request.url));
      return NextResponse.next();
    }

    if (pathname.startsWith("/account/") || pathname === "/account") {
      if (!isLoggedIn) return NextResponse.redirect(new URL("/login", request.url));
      return NextResponse.next();
    }

    return NextResponse.next();
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
        try {
          const { data: member } = await supabase
            .from("team_members")
            .select("role")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();
          const isAdmin = member && ["admin", "editor", "super_admin"].includes(String(member.role ?? ""));
          if (!isAdmin) return NextResponse.redirect(new URL("/admin/login", request.url));
        } catch {
          // team_members table may not exist; allow if user exists
        }
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
    "/api/auth/:path*",
  ],
};
