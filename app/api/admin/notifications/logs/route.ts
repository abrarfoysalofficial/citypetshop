import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications/logs
 * Returns recent notification logs.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const limit = Math.min(50, parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10) || 20);

  try {
    const tenantId = getDefaultTenantId();
    const logs = await prisma.notificationLog.findMany({
      where: { tenantId },
      orderBy: { sentAt: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[admin/notifications/logs]", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
