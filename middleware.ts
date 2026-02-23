import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { buildRedirectUrl } from "@/lib/site-url";

/** Production: Prisma only. Dev: Prisma if DATABASE_URL set, else demo. */
const AUTH_MODE =
  process.env.NODE_ENV === "production"
    ? "prisma"
    : (process.env.DATABASE_URL ? "prisma" : "demo");

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit admin login attempts
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const ip = getClientIp(request);
    const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
      );
    }
  }

  // Production: never allow demo mode
  if (process.env.NODE_ENV === "production" && AUTH_MODE === "demo") {
    return NextResponse.redirect(buildRedirectUrl(request, "/503"));
  }

  // DEV-only routes: 404 in production
  if (pathname.startsWith("/dev/") && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(buildRedirectUrl(request, "/"));
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
        if (pathname === "/admin/login") return NextResponse.redirect(buildRedirectUrl(request, "/admin"));
      }
      if (isLoggedIn && pathname === "/login") return NextResponse.redirect(buildRedirectUrl(request, "/account"));
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      const isAdmin = token && adminRoles.includes((token as { role?: string }).role ?? "");
      if (!isAdmin) return NextResponse.redirect(buildRedirectUrl(request, "/admin/login"));
      return NextResponse.next();
    }

    if (pathname.startsWith("/account/") || pathname === "/account") {
      if (!isLoggedIn) return NextResponse.redirect(buildRedirectUrl(request, "/login"));
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // Demo mode: use demo_session cookie
  const session = request.cookies.get("demo_session")?.value;

  if (pathname === "/admin/login" || pathname === "/login") {
    if (session === "admin" && pathname === "/admin/login") {
      return NextResponse.redirect(buildRedirectUrl(request, "/admin"));
    }
    if ((session === "user" || session === "admin") && pathname === "/login") {
      return NextResponse.redirect(buildRedirectUrl(request, "/account"));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/") || pathname === "/admin") {
    if (session !== "admin") return NextResponse.redirect(buildRedirectUrl(request, "/admin/login"));
    return NextResponse.next();
  }

  if (pathname.startsWith("/account/") || pathname === "/account") {
    if (session !== "user" && session !== "admin") return NextResponse.redirect(buildRedirectUrl(request, "/login"));
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
