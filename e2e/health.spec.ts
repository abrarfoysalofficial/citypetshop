import { test, expect } from "@playwright/test";

test.describe("Health", () => {
  test("Health endpoint returns OK", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
