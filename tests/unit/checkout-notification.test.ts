/**
 * Checkout + notifications: adapter throw does not fail checkout; duplicate replays skip send.
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
      notificationLog: { create: jest.fn(), updateMany: jest.fn() },
      __mocks: { mockOrderCreate, mockOrderItemCreateMany },
    },
  };
});

jest.mock("@/lib/notifications", () => ({
  sendOrderConfirmationEmail: jest.fn(),
  sendOrderStatusSms: jest.fn(),
}));

jest.mock("@/lib/notification-log", () => ({
  tryAcquireNotificationSlot: jest.fn(),
  updateNotificationLog: jest.fn().mockResolvedValue(undefined),
  truncateRecipient: jest.fn((r: string) => (r.includes("@") ? "***@***" : "****")),
  NOTIFICATION_TYPES: {
    ORDER_CONFIRMATION_EMAIL: "order_confirmation_email",
    ORDER_STATUS_SMS_CONFIRMED: "order_status_sms_confirmed",
  },
}));

const validBody = {
  customerName: "Test User",
  email: "test@example.com",
  phone: "01712345678",
  total: 1000,
  items: [{ name: "Product A", qty: 1, price: 1000 }],
  shippingAddress: "Dhaka",
  shippingCity: "Dhaka",
  paymentMethod: "cod",
};

function createRequest(body: object) {
  return new NextRequest("http://localhost/api/checkout/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Checkout: notification adapter throw does not fail order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { prisma } = require("@/lib/db");
    prisma.order.create.mockResolvedValue({ id: "order-123" });
    prisma.orderItem.createMany.mockResolvedValue({ count: 1 });
    const { tryAcquireNotificationSlot } = require("@/lib/notification-log");
    tryAcquireNotificationSlot.mockResolvedValue(true);
  });

  it("returns orderId when email adapter throws (order creation not blocked)", async () => {
    const { sendOrderConfirmationEmail, sendOrderStatusSms } = require("@/lib/notifications");
    sendOrderConfirmationEmail.mockRejectedValue(new Error("Resend API error"));
    sendOrderStatusSms.mockResolvedValue({ ok: true });

    const res = await POST(createRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orderId).toBe("order-123");
  });

  it("returns orderId when SMS adapter throws (order creation not blocked)", async () => {
    const { sendOrderConfirmationEmail, sendOrderStatusSms } = require("@/lib/notifications");
    sendOrderConfirmationEmail.mockResolvedValue({ ok: true });
    sendOrderStatusSms.mockRejectedValue(new Error("SMS provider timeout"));

    const res = await POST(createRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orderId).toBe("order-123");
  });
});

describe("Checkout: duplicate request replays skip send", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { prisma } = require("@/lib/db");
    prisma.order.create.mockResolvedValue({ id: "order-no-send" });
    prisma.orderItem.createMany.mockResolvedValue({ count: 1 });
  });

  it("skips email send when slot already taken (idempotent replay)", async () => {
    const { tryAcquireNotificationSlot } = require("@/lib/notification-log");
    tryAcquireNotificationSlot.mockResolvedValue(false);

    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(200);

    const { sendOrderConfirmationEmail } = require("@/lib/notifications");
    expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });
});
