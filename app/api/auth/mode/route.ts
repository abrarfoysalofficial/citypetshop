import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Auth mode is Clerk identity + Prisma business profile. */
export async function GET() {
  return NextResponse.json({ mode: "clerk-prisma" });
}
