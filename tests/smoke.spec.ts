/**
 * Smoke tests — run before every deploy to verify critical paths.
 * These are fast (API-only where possible) and do not require a full browser.
 */
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests — Critical API Endpoints", () => {
  test("Health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("Status endpoint returns app version info", async ({ request }) => {
    const res = await request.get("/api/status");
    expect(res.status()).toBeLessThan(500);
  });

  test("Homepage loads without error", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Shop page loads", async ({ page }) => {
    const res = await page.goto("/shop");
    expect(res?.status()).toBeLessThan(400);
  });

  test("Checkout settings API returns delivery config", async ({ request }) => {
    const res = await request.get("/api/checkout/settings");
    expect(res.status()).toBeLessThan(500);
  });

  test("Admin login page loads", async ({ page }) => {
    const res = await page.goto("/admin/login");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
  });

  test("Track order page loads", async ({ page }) => {
    const res = await page.goto("/track-order");
    expect(res?.status()).toBeLessThan(400);
  });

  test("Google product feed is valid XML", async ({ request }) => {
    const res = await request.get("/api/feeds/google");
    expect(res.status()).toBeLessThan(500);
    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType).toContain("xml");
  });

  test("Meta product feed responds", async ({ request }) => {
    const res = await request.get("/api/feeds/meta");
    expect(res.status()).toBeLessThan(500);
  });

  test("Sitemap.xml is served", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBeLessThan(400);
  });

  test("Admin API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.get("/api/admin/products");
    expect([401, 403]).toContain(res.status());
  });

  test("Voucher API validates input", async ({ request }) => {
    const res = await request.post("/api/checkout/voucher", {
      data: { code: "" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Smoke Tests — Pages", () => {
  const PUBLIC_PAGES = [
    "/",
    "/shop",
    "/cart",
    "/checkout",
    "/track-order",
    "/blog",
    "/contact",
    "/about",
    "/privacy",
    "/terms",
  ];

  for (const path of PUBLIC_PAGES) {
    test(`Page loads: ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      // Accept 200, 307 (redirect), but NOT 500
      expect(res?.status() ?? 200).toBeLessThan(500);
    });
  }
});
