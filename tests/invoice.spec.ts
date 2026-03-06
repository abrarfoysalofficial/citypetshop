import { test, expect } from "@playwright/test";

test.describe("Invoice API authorization", () => {
  test("unauthenticated request returns 401", async ({ request }) => {
    const res = await request.get("/api/invoice?orderId=00000000-0000-0000-0000-000000000001");
    expect(res.status()).toBe(401);
    const body = await res.json().catch(() => ({}));
    expect(body.error).toContain("Sign in");
  });

  test("missing orderId returns 400", async ({ request }) => {
    const res = await request.get("/api/invoice");
    expect(res.status()).toBe(400);
    const body = await res.json().catch(() => ({}));
    expect(body.error).toContain("orderId");
  });

  test("invoice response has Cache-Control private when successful", async ({ request }) => {
    const res = await request.get("/api/invoice?orderId=00000000-0000-0000-0000-000000000001");
    if (res.status() === 200) {
      const cacheControl = res.headers()["cache-control"];
      expect(cacheControl).toContain("private");
      expect(cacheControl).toContain("no-store");
    }
  });
});
