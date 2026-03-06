/**
 * Fraud detection tests: duplicate order, velocity, IP block.
 * Tests logic in isolation (no DB).
 */
import { checkFraud } from "@lib/fraud";

// Mock prisma
jest.mock("@lib/db", () => ({
  prisma: {
    fraudPolicy: {
      findUnique: jest.fn().mockResolvedValue({
        blockThreshold: 60,
        otpThreshold: 40,
        manualReviewThreshold: 30,
        phoneVelocityLimit: 3,
        phoneVelocityHours: 24,
        ipRiskScoreThreshold: 70,
      }),
    },
    blockedIp: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    order: {
      count: jest.fn().mockResolvedValue(0),
    },
    riskScore: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}));

describe("Fraud: IP block", () => {
  beforeEach(() => {
    const { prisma } = require("@lib/db");
    prisma.blockedIp.findFirst.mockResolvedValue(null);
  });

  it("passes when IP not blocked", async () => {
    const result = await checkFraud({ ip: "192.168.1.1" });
    expect(result.passed).toBe(true);
  });

  it("blocks when IP is in blocklist", async () => {
    const { prisma } = require("@lib/db");
    prisma.blockedIp.findFirst.mockResolvedValue({ ip: "10.0.0.1", reason: "Abuse" });
    const result = await checkFraud({ ip: "10.0.0.1" });
    expect(result.passed).toBe(false);
    expect(result.flags).toContain("ip_blocked");
  });
});

describe("Fraud: duplicate phone velocity", () => {
  beforeEach(() => {
    const { prisma } = require("@lib/db");
    prisma.blockedIp.findFirst.mockResolvedValue(null);
  });

  it("passes when phone has < 3 orders in 24h", async () => {
    const { prisma } = require("@lib/db");
    prisma.order.count.mockResolvedValue(2);
    const result = await checkFraud({ phone: "01712345678" });
    expect(result.passed).toBe(true);
  });

  it("flags when phone has >= 3 orders in 24h", async () => {
    const { prisma } = require("@lib/db");
    prisma.order.count.mockResolvedValue(3);
    const result = await checkFraud({ phone: "01712345678" });
    expect(result.flags).toContain("duplicate_phone_velocity");
    expect(result.score).toBeGreaterThanOrEqual(30);
  });
});
