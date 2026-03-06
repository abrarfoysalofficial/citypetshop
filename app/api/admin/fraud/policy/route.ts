import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { createAuditLog } from "@lib/audit";

export const dynamic = "force-dynamic";

/** GET: Fraud policy (thresholds) */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const policy = await prisma.fraudPolicy.findUnique({
    where: { id: "default" },
  });
  if (!policy) {
    const created = await prisma.fraudPolicy.create({
      data: { id: "default" },
    });
    return NextResponse.json({ policy: created });
  }
  return NextResponse.json({
    policy: {
      blockThreshold: policy.blockThreshold,
      otpThreshold: policy.otpThreshold,
      manualReviewThreshold: policy.manualReviewThreshold,
      phoneVelocityLimit: policy.phoneVelocityLimit,
      phoneVelocityHours: policy.phoneVelocityHours,
      ipRiskScoreThreshold: policy.ipRiskScoreThreshold,
    },
  });
}

/** PATCH: Update fraud policy */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, number> = {};
  if (typeof body.blockThreshold === "number") update.blockThreshold = body.blockThreshold;
  if (typeof body.otpThreshold === "number") update.otpThreshold = body.otpThreshold;
  if (typeof body.manualReviewThreshold === "number") update.manualReviewThreshold = body.manualReviewThreshold;
  if (typeof body.phoneVelocityLimit === "number") update.phoneVelocityLimit = body.phoneVelocityLimit;
  if (typeof body.phoneVelocityHours === "number") update.phoneVelocityHours = body.phoneVelocityHours;
  if (typeof body.ipRiskScoreThreshold === "number") update.ipRiskScoreThreshold = body.ipRiskScoreThreshold;

  const prev = await prisma.fraudPolicy.findUnique({ where: { id: "default" } });
  const policy = await prisma.fraudPolicy.upsert({
    where: { id: "default" },
    create: { id: "default", ...update },
    update,
  });
  await createAuditLog({
    userId: auth.userId,
    action: "update",
    resource: "fraud_policy",
    resourceId: "default",
    oldValues: prev ? { blockThreshold: prev.blockThreshold, otpThreshold: prev.otpThreshold, manualReviewThreshold: prev.manualReviewThreshold } : undefined,
    newValues: update,
  });
  return NextResponse.json({ policy });
}
