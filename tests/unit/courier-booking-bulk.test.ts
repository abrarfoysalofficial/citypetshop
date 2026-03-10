/**
 * Courier bulk booking: API route handler test.
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/courier-booking/bulk/route";

jest.mock("@/lib/admin-auth", () => ({
  requireAdminAuth: jest.fn(),
}));

jest.mock("@/lib/tenant", () => ({
  getDefaultTenantId: jest.fn().mockReturnValue("tenant-1"),
}));

jest.mock("@/lib/courier/booking", () => ({
  bookCourier: jest.fn(),
}));

const requireAdminAuth = require("@/lib/admin-auth").requireAdminAuth;
const bookCourier = require("@/lib/courier/booking").bookCourier;

function createRequest(body: object) {
  return new NextRequest("http://localhost/api/admin/courier-booking/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/courier-booking/bulk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminAuth.mockResolvedValue({ ok: true });
  });

  it("returns 401 when not authenticated", async () => {
    requireAdminAuth.mockResolvedValue({ ok: false, status: 401, message: "Sign in required" });
    const res = await POST(createRequest({ orderIds: ["ord-1"], provider: "pathao" }));
    expect(res.status).toBe(401);
    expect(bookCourier).not.toHaveBeenCalled();
  });

  it("returns per-order results", async () => {
    bookCourier
      .mockResolvedValueOnce({ success: true, trackingCode: "TRK-1" })
      .mockResolvedValueOnce({ success: false, error: "Order not found", status: 404 });
    const res = await POST(createRequest({ orderIds: ["ord-1", "ord-2"], provider: "pathao" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results).toHaveLength(2);
    expect(data.results[0]).toEqual({ orderId: "ord-1", success: true, trackingCode: "TRK-1" });
    expect(data.results[1]).toEqual({ orderId: "ord-2", success: false, error: "Order not found" });
    expect(data.successCount).toBe(1);
    expect(data.failCount).toBe(1);
  });

  it("returns 400 for invalid request", async () => {
    const res = await POST(createRequest({ orderIds: [], provider: "pathao" }));
    expect(res.status).toBe(400);
  });
});
