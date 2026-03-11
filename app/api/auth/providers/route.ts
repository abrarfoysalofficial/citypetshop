import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns enabled auth providers. Clerk controls provider availability. */
export async function GET() {
  return NextResponse.json({ provider: "clerk" });
}
