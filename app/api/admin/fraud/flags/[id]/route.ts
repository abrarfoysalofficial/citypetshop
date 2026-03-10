import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** PATCH: Approve or reject fraud flag (review) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body.action as "approve" | "reject";

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const flag = await prisma.fraudFlag.findUnique({ where: { id } });
  if (!flag) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (flag.reviewStatus !== "pending") {
    return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
  }

  await prisma.fraudFlag.update({
    where: { id },
    data: {
      reviewStatus: action === "approve" ? "approved" : "rejected",
      reviewedBy: auth.userId,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, action });
}
