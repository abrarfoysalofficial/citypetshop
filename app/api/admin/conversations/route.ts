/**
 * GET /api/admin/conversations  — list conversations with optional status filter
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // open | escalated | closed
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "30", 10));
  const skip = (page - 1) * pageSize;

  const where = status ? { status } : {};

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return NextResponse.json({ conversations, total, page, pageSize });
}
