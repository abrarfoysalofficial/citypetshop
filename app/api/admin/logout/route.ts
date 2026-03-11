/**
 * GET /api/admin/logout
 * Redirect to Clerk-backed logout page.
 */
import { NextRequest, NextResponse } from "next/server";
import { buildRedirectUrl } from "@lib/site-url";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const target = `/logout?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(buildRedirectUrl(request, target));
}
