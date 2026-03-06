/**
 * Notification log: idempotency, truncateRecipient, duplicate skip.
 */
import {
  truncateRecipient,
  tryAcquireNotificationSlot,
  NOTIFICATION_TYPES,
} from "@lib/notification-log";

jest.mock("@lib/db", () => ({
  prisma: {
    notificationLog: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

describe("truncateRecipient", () => {
  it("truncates email – no full address stored", () => {
    expect(truncateRecipient("user@example.com", "email")).toBe("us***@ex***");
    expect(truncateRecipient("a@b.co", "email")).toBe("a***@b***");
  });

  it("returns safe fallback for invalid email", () => {
    expect(truncateRecipient("@nodomain", "email")).toBe("***@***");
  });

  it("truncates phone – no full number stored", () => {
    expect(truncateRecipient("01712345678", "sms")).toBe("****5678");
    expect(truncateRecipient("+8801712345678", "sms")).toBe("****5678");
  });

  it("returns safe fallback for short phone", () => {
    expect(truncateRecipient("123", "sms")).toBe("****");
  });
});

describe("tryAcquireNotificationSlot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { prisma } = require("@lib/db");
    prisma.notificationLog.create.mockResolvedValue({});
  });

  it("returns true when slot acquired (first send)", async () => {
    const result = await tryAcquireNotificationSlot(
      "tenant-1",
      "order-1",
      NOTIFICATION_TYPES.ORDER_CONFIRMATION_EMAIL,
      "email",
      "us***@ex***"
    );
    expect(result).toBe(true);
    const { prisma } = require("@lib/db");
    expect(prisma.notificationLog.create).toHaveBeenCalledTimes(1);
  });

  it("returns false on duplicate (P2002) – idempotency prevents second send", async () => {
    const { prisma } = require("@lib/db");
    prisma.notificationLog.create
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ code: "P2002" });

    const first = await tryAcquireNotificationSlot(
      "tenant-1",
      "order-1",
      NOTIFICATION_TYPES.ORDER_CONFIRMATION_EMAIL,
      "email",
      "us***@ex***"
    );
    expect(first).toBe(true);

    const second = await tryAcquireNotificationSlot(
      "tenant-1",
      "order-1",
      NOTIFICATION_TYPES.ORDER_CONFIRMATION_EMAIL,
      "email",
      "us***@ex***"
    );
    expect(second).toBe(false);
  });

  it("re-throws on non-P2002 errors", async () => {
    const { prisma } = require("@lib/db");
    prisma.notificationLog.create.mockRejectedValue(new Error("DB connection failed"));

    await expect(
      tryAcquireNotificationSlot(
        "tenant-1",
        "order-1",
        NOTIFICATION_TYPES.ORDER_CONFIRMATION_EMAIL,
        "email",
        "us***@ex***"
      )
    ).rejects.toThrow("DB connection failed");
  });
});
