import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Auth mode is always Prisma (NextAuth with PostgreSQL). */
export async function GET() {
  return NextResponse.json({ mode: "prisma" });
}
