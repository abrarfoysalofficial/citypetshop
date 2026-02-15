import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAdminDashboardStats } from "@/src/data/provider";

export const dynamic = "force-dynamic";

/** GET: Dashboard stats. Branches through provider; no Supabase in demo mode. */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const data = await getAdminDashboardStats();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/dashboard] error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
