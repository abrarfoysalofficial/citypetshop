import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  void request;
  return NextResponse.json(
    {
      error: "Password changes are managed by Clerk. Use /user-profile.",
      code: "CLERK_MANAGED_PASSWORD",
    },
    { status: 410 }
  );
}
