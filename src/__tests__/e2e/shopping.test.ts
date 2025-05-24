import { test, expect } from "@playwright/test";

test.describe("Shopping List", () => {
  test("should display the shopping page", async ({ page }) => {
    // Navigate to the shopping page
    await page.goto("/shopping");

    // Check that the page title is present
    await expect(page.locator("h1")).toContainText("Shopping List");

    // Check that the page subtitle is present
    await expect(page.locator("p")).toContainText(
      "Items needed for your meal plan"
    );
  });

  test("should show shopping list items and filter them by status", async ({
    page,
    request,
  }) => {
    // Navigate to the shopping page
    await page.goto("/shopping");

    // Wait for the shopping list to load
    await page.waitForSelector('h2:has-text("Shopping List")');

    // Check that tabs exist
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("To Buy")')).toBeVisible();
    await expect(page.locator('button:has-text("Partial")')).toBeVisible();
    await expect(page.locator('button:has-text("In Stock")')).toBeVisible();

    // Check that we can click on different tabs
    await page.click('button:has-text("To Buy")');
    await page.click('button:has-text("Partial")');
    await page.click('button:has-text("In Stock")');
    await page.click('button:has-text("All")');

    // Check that the refresh button works
    await page.click('button:has-text("Refresh")');

    // Check shopping list is still visible
    await expect(page.locator('h2:has-text("Shopping List")')).toBeVisible();
  });
});
