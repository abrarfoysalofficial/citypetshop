import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuthAndPermission } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: List audit logs with pagination */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuthAndPermission("audit.view");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const resource = searchParams.get("resource") ?? "";
  const offset = (page - 1) * limit;

  try {
    const where: { resource?: { contains: string; mode: "insensitive" } } = {};
    if (resource) where.resource = { contains: resource, mode: "insensitive" };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        userId: l.userId,
        actorEmail: l.user?.email,
        actorName: l.user?.name,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        oldValues: l.oldValues,
        newValues: l.newValues,
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[admin/audit-logs] GET:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
