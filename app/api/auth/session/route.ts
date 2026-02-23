import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AUTH_MODE } from "@/src/config/runtime";

export const dynamic = "force-dynamic";

/** Returns session status for client-side auth checks. Prisma (NextAuth) or demo only. */
export async function GET(request: NextRequest) {
  if (AUTH_MODE === "demo") {
    const session = request.cookies.get("demo_session")?.value;
    const isLoggedIn = session === "user" || session === "admin";
    return NextResponse.json({ isLoggedIn, session: isLoggedIn ? session : null });
  }
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    isLoggedIn: !!session?.user,
    session: session?.user ? { id: (session.user as { id?: string }).id, email: session.user.email } : null,
  });
}
