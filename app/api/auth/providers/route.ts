import { NextResponse } from "next/server";
import { AUTH_MODE } from "@/src/config/runtime";

export const dynamic = "force-dynamic";

/** Returns enabled auth providers. Prisma mode: credentials only (no OAuth). */
export async function GET() {
  if (AUTH_MODE !== "supabase") {
    return NextResponse.json({ google: false, facebook: false, phone: false });
  }
  return NextResponse.json({ google: false, facebook: false, phone: false });
}
