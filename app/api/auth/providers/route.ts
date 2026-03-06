import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns enabled auth providers. Prisma/NextAuth: credentials only (no OAuth). */
export async function GET() {
  return NextResponse.json({ google: false, facebook: false, phone: false });
}
