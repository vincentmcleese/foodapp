import { test, expect } from "@playwright/test";

test.describe("Fridge Page", () => {
  test.skip("should display the fridge page", async ({ page }) => {
    // Navigate to the fridge page
    await page.goto("/fridge");

    // Check if some basic elements are visible
    await expect(page.locator("select")).toBeVisible();
    await expect(page.getByText(/add new ingredient/i)).toBeVisible();
  });

  // This test assumes you have a clean test environment with predictable data
  // You may need to adjust or disable this test depending on your setup
  test.skip("should be able to add a new fridge item", async ({ page }) => {
    // Navigate to the fridge page
    await page.goto("/fridge");

    // Fill the form
    await page.selectOption('select[name="ingredient_id"]', { index: 1 }); // Select the first ingredient
    await page.fill('input[name="quantity"]', "3");
    await page.fill('input[name="unit"]', "kg");

    // Submit the form
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Wait for the item to be added (this assumes we have a loading state)
    await expect(page.getByText("Adding...")).toBeVisible();
    await expect(page.getByText("Adding...")).not.toBeVisible();

    // Check if the item was added
    // This assumes we can identify the newly added item somehow
    // In a real test, you might check for specific text or a specific element
    const itemElements = await page.$$(".card");
    expect(itemElements.length).toBeGreaterThan(0);
  });
});
