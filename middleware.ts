import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimitSync } from "@/lib/rate-limit-memory";
import { buildRedirectUrl } from "@/lib/site-url";

/** NextAuth with Prisma – credentials auth only. */

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit admin login attempts (credentials POST)
  if (
    (pathname === "/api/auth/signin/credentials" || pathname === "/api/auth/callback/credentials") &&
    request.method === "POST"
  ) {
    const ip = getClientIp(request);
    const rl = rateLimitSync(`admin-login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
      );
    }
  }

  // DEV-only routes: 404 in production
  if (pathname.startsWith("/dev/") && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(buildRedirectUrl(request, "/"));
  }

  // NextAuth JWT
  {
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
      // If unauthenticated user hit /login with admin callbackUrl, redirect to admin login
      if (pathname === "/login" && !isLoggedIn) {
        const callback = request.nextUrl.searchParams.get("callbackUrl") ?? request.nextUrl.searchParams.get("next");
        if (typeof callback === "string") {
          let path = callback;
          if (!callback.startsWith("/")) {
            try {
              path = new URL(callback).pathname;
            } catch {
              path = "";
            }
          }
          if (path === "/admin" || path.startsWith("/admin/")) {
            return NextResponse.redirect(buildRedirectUrl(request, `/admin/login?callbackUrl=${encodeURIComponent(callback)}`));
          }
        }
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      const isAdmin = token && adminRoles.includes((token as { role?: string }).role ?? "");
      if (!isAdmin) return NextResponse.redirect(buildRedirectUrl(request, "/admin/login"));
      return NextResponse.next();
    }

    // Admin API routes: require auth at edge (defense in depth; routes also use requireAdminAuth)
    if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/logout")) {
      const isAdmin = token && adminRoles.includes((token as { role?: string }).role ?? "");
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/account/") || pathname === "/account") {
      if (!isLoggedIn) return NextResponse.redirect(buildRedirectUrl(request, "/login"));
      return NextResponse.next();
    }

    return NextResponse.next();
  }
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
    "/api/admin",
    "/api/admin/:path*",
  ],
};
