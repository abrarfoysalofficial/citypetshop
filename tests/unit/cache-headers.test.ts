/**
 * PR-8: Verify cache headers for key API endpoints.
 */
jest.mock("@/lib/tenant", () => ({
  getDefaultTenantId: jest.fn().mockReturnValue("tenant-1"),
}));

jest.mock("@/lib/db", () => ({
  prisma: {
    tenantSettings: { findUnique: jest.fn().mockResolvedValue(null) },
  },
}));

describe("PR-8 Cache headers", () => {
  it("GET /api/settings returns cacheable headers", async () => {
    const { GET } = await import("@/app/api/settings/route");
    const res = await GET();
    const cc = res.headers.get("Cache-Control");
    expect(cc).toBeTruthy();
    expect(cc).toMatch(/s-maxage|max-age|stale-while-revalidate/i);
  });

  it("checkout order route remains force-dynamic", async () => {
    const route = await import("@/app/api/checkout/order/route");
    expect((route as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
