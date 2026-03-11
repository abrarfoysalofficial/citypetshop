import { NextResponse } from "next/server";
import { auth } from "@lib/auth";

export const dynamic = "force-dynamic";

/** Returns session status from Clerk-backed auth facade. */
export async function GET() {
  const session = await auth();
  return NextResponse.json({
    isLoggedIn: !!session?.user,
    session: session?.user ? { id: session.user.id, email: session.user.email, role: session.user.role } : null,
  });
}
