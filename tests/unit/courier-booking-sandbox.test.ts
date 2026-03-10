/**
 * Courier booking: sandbox flag persistence in CourierBookingLog.
 */
import { bookCourier } from "@/lib/courier/booking";

const mockCreate = jest.fn();
const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();

const mockOrderUpdate = jest.fn().mockResolvedValue({});
const mockEventCreate = jest.fn().mockResolvedValue({});

jest.mock("@/lib/db", () => ({
  prisma: {
    order: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockOrderUpdate(...args),
    },
    courierBookingLog: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
    orderStatusEvent: { create: (...args: unknown[]) => mockEventCreate(...args) },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));

jest.mock("@/lib/courier/provider-config", () => ({
  isProviderConfigured: jest.fn().mockResolvedValue(true),
  isProviderEnabled: jest.fn().mockResolvedValue(true),
  getCourierSandbox: jest.fn(),
}));

jest.mock("@/lib/courier/pathao-client", () => ({
  getPathaoClient: jest.fn().mockResolvedValue({}),
  getPathaoStoreId: jest.fn().mockResolvedValue("store-1"),
  createPathaoOrder: jest.fn().mockResolvedValue({
    success: true,
    consignmentId: "CONS-123",
  }),
}));

jest.mock("@/lib/logger", () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

const getCourierSandbox = require("@/lib/courier/provider-config").getCourierSandbox;

describe("bookCourier sandbox persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ id: "log-1", tenantId: "t1", orderId: "ord-1", provider: "pathao", consignmentId: "CONS-123", trackingCode: "CONS-123", requestHash: "abc", sandbox: true, status: "created", createdAt: new Date(), updatedAt: new Date() });
    mockFindFirst.mockResolvedValue({
      id: "ord-1",
      tenantId: "t1",
      shippingPhone: "01700000000",
      shippingName: "Customer",
      shippingAddress: "Dhaka",
      shippingCity: "Dhaka",
      paymentMethod: "cod",
      total: 100,
    });
    mockFindUnique.mockResolvedValue(null);
  });

  it("stores sandbox=true when getCourierSandbox returns true", async () => {
    getCourierSandbox.mockResolvedValue(true);
    const result = await bookCourier("t1", "ord-1", "pathao");
    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalled();
    const createData = mockCreate.mock.calls[0][0]?.data ?? mockCreate.mock.calls[0][0];
    expect(createData.sandbox).toBe(true);
    expect(createData.requestHash).toBeDefined();
    expect(typeof createData.requestHash).toBe("string");
    expect(createData.requestHash.length).toBeGreaterThan(0);
  });

  it("stores sandbox=false when getCourierSandbox returns false", async () => {
    getCourierSandbox.mockResolvedValue(false);
    const result = await bookCourier("t1", "ord-1", "pathao");
    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalled();
    const createData = mockCreate.mock.calls[0][0]?.data ?? mockCreate.mock.calls[0][0];
    expect(createData.sandbox).toBe(false);
  });
});
