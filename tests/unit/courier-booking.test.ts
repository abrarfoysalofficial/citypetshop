/**
 * Courier booking: idempotency, 409 when not configured, non-admin blocked.
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/courier-booking/route";

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
  return new NextRequest("http://localhost/api/admin/courier-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/courier-booking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminAuth.mockResolvedValue({ ok: true });
  });

  it("returns 401 when not authenticated", async () => {
    requireAdminAuth.mockResolvedValue({ ok: false, status: 401, message: "Sign in required" });
    const res = await POST(createRequest({ orderId: "ord-1", provider: "pathao" }));
    expect(res.status).toBe(401);
    expect(bookCourier).not.toHaveBeenCalled();
  });

  it("returns 409 when provider not configured", async () => {
    bookCourier.mockResolvedValue({
      success: false,
      error: "Pathao credentials not configured",
      status: 409,
    });
    const res = await POST(createRequest({ orderId: "ord-1", provider: "pathao" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.providerNotConfigured).toBe(true);
  });

  it("returns idempotent result when already booked", async () => {
    bookCourier.mockResolvedValue({
      success: true,
      trackingCode: "TRK-123",
      consignmentId: "TRK-123",
      idempotent: true,
    });
    const res = await POST(createRequest({ orderId: "ord-1", provider: "pathao" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.idempotent).toBe(true);
    expect(data.trackingCode).toBe("TRK-123");
  });

  it("returns 400 for invalid request", async () => {
    const res = await POST(createRequest({ orderId: "", provider: "pathao" }));
    expect(res.status).toBe(400);
  });

  it("returns success with trackingCode and idempotent flag", async () => {
    bookCourier.mockResolvedValue({
      success: true,
      trackingCode: "TRK-456",
      consignmentId: "CONS-456",
      idempotent: false,
    });
    const res = await POST(createRequest({ orderId: "ord-2", provider: "pathao" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.trackingCode).toBe("TRK-456");
    expect(data.consignmentId).toBe("CONS-456");
    expect(data.idempotent).toBe(false);
  });
});
