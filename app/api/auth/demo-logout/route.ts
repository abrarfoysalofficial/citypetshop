import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set("demo_session", "", { path: "/", maxAge: 0 });
  return res;
}
