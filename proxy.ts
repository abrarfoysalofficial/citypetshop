import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { sanitizeAdminCallbackUrl, sanitizeCustomerCallbackUrl } from "@/lib/callback-url";
import { buildRedirectUrl } from "@/lib/site-url";

const isAdminPage = createRouteMatcher(["/admin(.*)"]);
const isAccountPage = createRouteMatcher(["/account(.*)"]);
const isAdminApi = createRouteMatcher(["/api/admin(.*)"]);
const isLoginRoute = createRouteMatcher(["/login(.*)", "/admin/login(.*)", "/sign-up(.*)"]);

function buildLoginTarget(pathname: string, callbackPath: string, fallbackPath: string): string {
  if (callbackPath === fallbackPath) return pathname;
  return `${pathname}?callbackUrl=${encodeURIComponent(callbackPath)}`;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth();
  const pathname = request.nextUrl.pathname;

  if (isLoginRoute(request) && userId) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(buildRedirectUrl(request, "/admin"));
    }
    return NextResponse.redirect(buildRedirectUrl(request, "/account"));
  }

  if (!userId && isAdminApi(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId && isAdminPage(request)) {
    const callback = sanitizeAdminCallbackUrl(
      `${pathname}${request.nextUrl.search || ""}`,
      request.nextUrl.origin
    );
    const target = buildLoginTarget("/admin/login", callback, "/admin");
    return NextResponse.redirect(buildRedirectUrl(request, target));
  }

  if (!userId && isAccountPage(request)) {
    const callback = sanitizeCustomerCallbackUrl(
      `${pathname}${request.nextUrl.search || ""}`,
      request.nextUrl.origin
    );
    const target = buildLoginTarget("/login", callback, "/account");
    return NextResponse.redirect(buildRedirectUrl(request, target));
  }

  if (pathname === "/admin/login" || pathname === "/login" || pathname === "/sign-up") {
    const rawCallback = request.nextUrl.searchParams.get("callbackUrl") ?? request.nextUrl.searchParams.get("next");
    const normalized =
      pathname === "/admin/login"
        ? sanitizeAdminCallbackUrl(rawCallback, request.nextUrl.origin)
        : sanitizeCustomerCallbackUrl(rawCallback, request.nextUrl.origin);
    const fallback = pathname === "/admin/login" ? "/admin" : "/account";
    const expectedPath = buildLoginTarget(pathname, normalized, fallback);
    const currentPath = `${pathname}${request.nextUrl.search || ""}`;
    if (currentPath !== expectedPath) {
      return NextResponse.redirect(buildRedirectUrl(request, expectedPath));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/api/:path*",
  ],
};

