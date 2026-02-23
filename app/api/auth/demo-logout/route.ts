import { NextRequest, NextResponse } from "next/server";
import { buildRedirectUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/** Demo logout: clear demo_session. For Prisma, use NextAuth signOut on client. */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const redirectUrl = buildRedirectUrl(request, next);
  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set("demo_session", "", { path: "/", maxAge: 0 });
  return res;
}
