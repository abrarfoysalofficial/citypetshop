/**
 * API tests: cannot read decrypted value; only masked metadata.
 * RBAC: non-admin 401/403.
 */
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/admin/settings/secure-config/route";

jest.mock("@lib/admin-auth", () => ({
  requireAdminAuthAndPermission: jest.fn(),
}));

jest.mock("@lib/tenant", () => ({
  getDefaultTenantId: jest.fn().mockReturnValue("tenant-1"),
}));

jest.mock("@lib/env-validation", () => ({
  validateMasterSecret: jest.fn().mockReturnValue({ ok: true }),
}));

jest.mock("@lib/db", () => ({
  prisma: {
    secureConfig: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    secureConfigAuditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@lib/crypto/secrets", () => ({
  encryptSecret: jest.fn((v: string) => `enc:${v}`),
  maskSecret: jest.fn((v: string) => (v.length > 4 ? "••••••••" + v.slice(-4) : "••••")),
}));

const requireAdminAuthAndPermission = require("@lib/admin-auth").requireAdminAuthAndPermission;
const prisma = require("@lib/db").prisma;

describe("GET /api/admin/settings/secure-config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminAuthAndPermission.mockResolvedValue({ ok: true, userId: "user-1" });
    prisma.secureConfig.findMany.mockResolvedValue([
      { key: "courier:pathao:client_id", valueLen: 24, updatedAt: new Date() },
    ]);
  });

  it("returns 401 when not authenticated", async () => {
    requireAdminAuthAndPermission.mockResolvedValue({ ok: false, status: 401, message: "Sign in required" });
    const res = await GET();
    expect(res.status).toBe(401);
    expect(prisma.secureConfig.findMany).not.toHaveBeenCalled();
  });

  it("returns 403 when no permission", async () => {
    requireAdminAuthAndPermission.mockResolvedValue({ ok: false, status: 403, message: "Access denied" });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns masked keys only, never decrypted value", async () => {
    const res = await GET();
    const data = await res.json();
    expect(data.keys).toBeDefined();
    expect(Array.isArray(data.keys)).toBe(true);
    expect(data.keys[0]).toHaveProperty("key");
    expect(data.keys[0]).toHaveProperty("masked");
    expect(data.keys[0]).toHaveProperty("length");
    expect(data.keys[0]).not.toHaveProperty("value");
    expect(data.keys[0]).not.toHaveProperty("valueEnc");
  });
});

describe("POST /api/admin/settings/secure-config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminAuthAndPermission.mockResolvedValue({ ok: true, userId: "user-1" });
    prisma.secureConfig.findUnique.mockResolvedValue(null);
    prisma.secureConfig.upsert.mockResolvedValue({});
    prisma.secureConfigAuditLog.create.mockResolvedValue({});
  });

  it("returns 401 when not authenticated", async () => {
    requireAdminAuthAndPermission.mockResolvedValue({ ok: false, status: 401, message: "Sign in required" });
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ key: "courier:pathao:client_id", value: "secret123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid key", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ key: "invalid.key", value: "x" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
