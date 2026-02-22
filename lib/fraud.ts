/**
 * Phase 10: Fraud detection engine.
 * Thresholds from DB (FraudPolicy). Runs before order confirmation.
 */
import { prisma } from "@/lib/db";

export interface FraudCheckResult {
  passed: boolean;
  score: number;
  flags: string[];
  blockReason?: string;
  requiresOtp?: boolean;
  requiresManualReview?: boolean;
}

async function getPolicy() {
  const policy = await prisma.fraudPolicy.findUnique({
    where: { id: "default" },
  });
  return policy ?? {
    blockThreshold: 60,
    otpThreshold: 40,
    manualReviewThreshold: 30,
    phoneVelocityLimit: 3,
    phoneVelocityHours: 24,
    ipRiskScoreThreshold: 70,
  };
}

export async function checkFraud(params: {
  phone?: string;
  email?: string;
  ip?: string;
  address?: string;
  orderTotal?: number;
}): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let score = 0;
  const policy = await getPolicy();

  // IP blacklist
  if (params.ip) {
    const blocked = await prisma.blockedIp.findFirst({
      where: {
        ip: params.ip,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (blocked) {
      return {
        passed: false,
        score: 100,
        flags: ["ip_blocked"],
        blockReason: blocked.reason ?? "IP blocked",
      };
    }
  }

  // Duplicate phone check - configurable limit and window
  if (params.phone) {
    const phoneNorm = params.phone.replace(/\D/g, "").slice(-10);
    const hoursAgo = new Date(Date.now() - policy.phoneVelocityHours * 60 * 60 * 1000);
    const recentOrders = await prisma.order.count({
      where: {
        OR: [
          { shippingPhone: { contains: phoneNorm } },
          { guestPhone: { contains: phoneNorm } },
        ],
        createdAt: { gte: hoursAgo },
      },
    });
    if (recentOrders >= policy.phoneVelocityLimit) {
      flags.push("duplicate_phone_velocity");
      score += 30;
    }
  }

  // Velocity - IP risk score
  if (params.ip) {
    const risk = await prisma.riskScore.findFirst({
      where: { entityType: "ip", entityId: params.ip },
    });
    if (risk && risk.score >= policy.ipRiskScoreThreshold) {
      flags.push("ip_risk_score");
      score += 30;
    }
  }

  const passed = score < policy.blockThreshold;
  const requiresOtp = !passed ? false : score >= policy.otpThreshold && score < policy.blockThreshold;
  const requiresManualReview = !passed ? false : score >= policy.manualReviewThreshold;

  return {
    passed,
    score,
    flags,
    requiresOtp,
    requiresManualReview,
  };
}

export async function recordFraudFlag(orderId: string, flagType: string, score: number, details?: Record<string, unknown>) {
  await prisma.fraudFlag.create({
    data: {
      orderId,
      flagType,
      score,
      detailsJson: details ? JSON.parse(JSON.stringify(details)) : undefined,
    },
  });
}

export async function blockIp(ip: string, reason?: string, expiresAt?: Date) {
  await prisma.blockedIp.upsert({
    where: { ip },
    create: { ip, reason, expiresAt },
    update: { reason, expiresAt },
  });
}
