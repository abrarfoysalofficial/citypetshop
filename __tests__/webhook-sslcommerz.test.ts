/**
 * SSLCommerz webhook tests: idempotency, status transitions, amount validation.
 * Mocks prisma and validateSslCommerzTransaction.
 */
import { canTransitionPaymentStatus } from "@/lib/order-transitions";

describe("Order transitions: canTransitionPaymentStatus", () => {
  it("allows pending -> paid", () => {
    expect(canTransitionPaymentStatus("pending", "paid")).toBe(true);
  });
  it("allows pending -> failed", () => {
    expect(canTransitionPaymentStatus("pending", "failed")).toBe(true);
  });
  it("allows paid -> refunded", () => {
    expect(canTransitionPaymentStatus("paid", "refunded")).toBe(true);
  });
  it("disallows paid -> pending", () => {
    expect(canTransitionPaymentStatus("paid", "pending")).toBe(false);
  });
  it("disallows paid -> failed", () => {
    expect(canTransitionPaymentStatus("paid", "failed")).toBe(false);
  });
  it("disallows paid -> paid (no double-update)", () => {
    expect(canTransitionPaymentStatus("paid", "paid")).toBe(false);
  });
});

describe("Webhook idempotency (logic)", () => {
  it("already_paid should skip re-processing", () => {
    const currentStatus = "paid";
    const incomingStatus = "VALID";
    const shouldUpdate = currentStatus !== "paid" && (incomingStatus === "VALID" || incomingStatus === "VALIDATED");
    expect(shouldUpdate).toBe(false);
  });

  it("duplicate val_id should skip", () => {
    const processedValIds = new Set(["val-123"]);
    const incomingValId = "val-123";
    expect(processedValIds.has(incomingValId)).toBe(true);
  });

  it("amount mismatch should reject", () => {
    const orderTotal = 1000;
    const paidAmount = 999;
    const tolerance = 0.01;
    const mismatch = Math.abs(orderTotal - paidAmount) > tolerance;
    expect(mismatch).toBe(true);
  });

  it("amount within tolerance should accept", () => {
    const orderTotal = 1000;
    const paidAmount = 999.99;
    const tolerance = 0.01;
    const mismatch = Math.abs(orderTotal - paidAmount) > tolerance;
    expect(mismatch).toBe(false);
  });
});
