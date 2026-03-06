import { test, expect } from "@playwright/test";

test.describe("Health", () => {
  test("Health endpoint returns OK", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

test.describe("Sitemap XML", () => {
  test("sitemap.xml returns valid XML with urlset schema", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("application/xml");
    const xml = await res.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("</urlset>");
    expect(xml).toMatch(/<loc>.*<\/loc>/);
  });

  test("sitemap.xml includes Cache-Control header", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    const cacheControl = res.headers()["cache-control"];
    expect(cacheControl).toBeDefined();
    expect(cacheControl).toContain("s-maxage");
  });
});
