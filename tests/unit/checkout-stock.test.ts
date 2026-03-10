/**
 * Checkout: stock validation — 409 on insufficient stock, transaction-safe.
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/order/route";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/tenant", () => ({
  getDefaultTenantId: jest.fn().mockReturnValue("tenant-default"),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ ok: true }),
  getRateLimitKey: jest.fn().mockReturnValue("key"),
}));

jest.mock("@/src/config/env", () => ({
  isPrismaConfigured: jest.fn().mockReturnValue(true),
}));

jest.mock("@/lib/fraud", () => ({
  checkFraud: jest.fn().mockResolvedValue({ passed: true, flags: [] }),
  recordFraudFlag: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/db", () => {
  const mockOrderCreate = jest.fn();
  const mockOrderItemCreateMany = jest.fn();
  const mockProductUpdate = jest.fn();
  const mockQueryRaw = jest.fn();
  return {
    prisma: {
      order: { create: mockOrderCreate },
      orderItem: { createMany: mockOrderItemCreateMany },
      product: { update: mockProductUpdate },
      $queryRaw: mockQueryRaw,
      $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          order: { create: mockOrderCreate },
          orderItem: { createMany: mockOrderItemCreateMany },
          product: { update: mockProductUpdate },
          $queryRaw: mockQueryRaw,
        };
        return cb(tx);
      }),
    },
  };
});

jest.mock("@/lib/notifications", () => ({
  sendOrderConfirmationEmail: jest.fn(),
  sendOrderStatusSms: jest.fn(),
}));

jest.mock("@/lib/notification-log", () => ({
  tryAcquireNotificationSlot: jest.fn().mockResolvedValue(false),
  updateNotificationLog: jest.fn().mockResolvedValue(undefined),
  truncateRecipient: jest.fn((r: string) => r),
  NOTIFICATION_TYPES: {},
}));

const productId = "11111111-1111-1111-1111-111111111111";

function createRequest(body: object) {
  return new NextRequest("http://localhost/api/checkout/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Checkout: stock validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 409 with insufficientStock when product has less stock than requested", async () => {
    const { prisma } = require("@/lib/db");
    prisma.$queryRaw.mockResolvedValue([{ id: productId, stock: 2, name_en: "Test Product" }]);

    const res = await POST(
      createRequest({
        customerName: "Test",
        total: 3000,
        items: [
          { productId, name: "Test Product", qty: 5, price: 600 },
        ],
        shippingAddress: "Dhaka",
        shippingCity: "Dhaka",
        paymentMethod: "cod",
      })
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("Insufficient stock");
    expect(data.insufficientStock).toHaveLength(1);
    expect(data.insufficientStock[0]).toMatchObject({
      productId,
      name: "Test Product",
      requested: 5,
      available: 2,
    });
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it("succeeds when stock is sufficient", async () => {
    const { prisma } = require("@/lib/db");
    prisma.$queryRaw.mockResolvedValue([{ id: productId, stock: 10, name_en: "Test Product" }]);
    prisma.order.create.mockResolvedValue({ id: "order-456" });
    prisma.orderItem.createMany.mockResolvedValue({ count: 1 });
    prisma.product.update.mockResolvedValue({});

    const res = await POST(
      createRequest({
        customerName: "Test",
        total: 600,
        items: [
          { productId, name: "Test Product", qty: 1, price: 600 },
        ],
        shippingAddress: "Dhaka",
        shippingCity: "Dhaka",
        paymentMethod: "cod",
      })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orderId).toBe("order-456");
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: { stock: { decrement: 1 } },
    });
  });

  it("skips stock validation for items without productId", async () => {
    const { prisma } = require("@/lib/db");
    prisma.order.create.mockResolvedValue({ id: "order-guest" });
    prisma.orderItem.createMany.mockResolvedValue({ count: 1 });

    const res = await POST(
      createRequest({
        customerName: "Guest",
        total: 500,
        items: [{ name: "Custom Item", qty: 1, price: 500 }],
        shippingAddress: "Dhaka",
        shippingCity: "Dhaka",
        paymentMethod: "cod",
      })
    );

    expect(res.status).toBe(200);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
    expect(prisma.order.create).toHaveBeenCalled();
  });
});
