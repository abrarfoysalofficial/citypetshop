import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration.
 * Run: npx playwright test
 * Run smoke only: npx playwright test e2e/smoke.spec.ts
 * Run with base URL: PLAYWRIGHT_BASE_URL=https://staging.example.com npx playwright test
 */
export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**", "**/*.test.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
