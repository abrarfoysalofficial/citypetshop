import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export const dynamic = "force-dynamic";

/** Returns session status for client-side auth checks. Prisma (NextAuth) only. */
export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    isLoggedIn: !!session?.user,
    session: session?.user ? { id: (session.user as { id?: string }).id, email: session.user.email } : null,
  });
}
