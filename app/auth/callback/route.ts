import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** OAuth callback. Prisma mode: no Supabase OAuth; redirect to login. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/account";
  return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=oauth_not_available`, request.url));
}
