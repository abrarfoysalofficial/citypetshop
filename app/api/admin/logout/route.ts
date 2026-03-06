/**
 * GET /api/admin/logout
 * Redirect to NextAuth signout, then to admin login.
 */
import { NextRequest, NextResponse } from "next/server";
import { buildRedirectUrl } from "@lib/site-url";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/admin/login";
  const signoutUrl = `${buildRedirectUrl(request, "/api/auth/signout")}?callbackUrl=${encodeURIComponent(next)}`;
  return NextResponse.redirect(signoutUrl);
}
