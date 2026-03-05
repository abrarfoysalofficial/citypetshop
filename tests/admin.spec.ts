import { test, expect } from "@playwright/test";

test.describe("Admin", () => {
  test("Admin login → Edit product → Save", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page).toHaveTitle(/login|admin/i);

    // Login (requires seeded admin)
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL ?? "admin@citypetshop.bd");
    await page.getByLabel(/password/i).fill(process.env.TEST_ADMIN_PASSWORD ?? "Admin@12345");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Should redirect to admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });

    // Go to products
    await page.getByRole("link", { name: /products/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/products/);

    // Click first product to edit
    const editLink = page.getByRole("link", { name: /edit|view/i }).first();
    if (await editLink.isVisible()) {
      await editLink.click();
      // Save (no changes)
      const saveBtn = page.getByRole("button", { name: /save|update/i }).first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
