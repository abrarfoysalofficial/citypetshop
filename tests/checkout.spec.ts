import { test, expect } from "@playwright/test";

test.describe("Checkout flow", () => {
  test("Home → Product → Cart → Checkout → COD → Order complete", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/City Plus|Pet Shop/i);

    // Go to shop
    await page.getByRole("link", { name: /shop/i }).first().click();
    await expect(page).toHaveURL(/\/(shop|category)/);

    // Click first product
    const productLink = page.getByRole("link", { name: /product/i }).first();
    await productLink.click();
    await expect(page).toHaveURL(/\/product\//);

    // Add to cart
    await page.getByRole("button", { name: /add to cart/i }).first().click();

    // Go to cart
    await page.getByRole("link", { name: /cart/i }).first().click();
    await expect(page).toHaveURL(/\/cart/);

    // Proceed to checkout
    await page.getByRole("link", { name: /checkout|proceed/i }).first().click();
    await expect(page).toHaveURL(/\/checkout/);

    // Fill checkout form (guest)
    await page.getByLabel(/name|customer/i).first().fill("Test Customer");
    await page.getByLabel(/phone/i).first().fill("01712345678");
    await page.getByLabel(/address/i).first().fill("Dhaka, Bangladesh");

    // Place order (COD)
    await page.getByRole("button", { name: /place order|confirm|submit/i }).first().click();

    // Should show success or order confirmation
    await expect(page.getByText(/order|success|thank you|confirmed/i)).toBeVisible({ timeout: 10000 });
  });
});
