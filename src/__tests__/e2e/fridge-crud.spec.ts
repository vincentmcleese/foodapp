import { test, expect } from "@playwright/test";

test.describe("Fridge CRUD E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fridge");
  });

  // These tests require a working database with ingredients
  // Skip them until we have a proper test environment
  test.skip("can add, edit, and delete a fridge item", async ({ page }) => {
    // Select an ingredient from the dropdown
    // (assuming there are ingredients already in the database)
    await page.selectOption('select[name="ingredient_id"]', { index: 1 });
    await page.getByPlaceholder("Quantity").fill("2");
    await page.getByPlaceholder("Unit").fill("L");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    
    // Wait for the item to be added
    await expect(page.locator(".card").filter({ hasText: "2 L" })).toBeVisible();
    
    // Edit the item
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByPlaceholder("Quantity").fill("3");
    await page.getByRole("button", { name: "Save" }).click();
    
    // Check that the item was updated
    await expect(page.locator(".card").filter({ hasText: "3 L" })).toBeVisible();
    
    // Delete the item
    await page.getByRole("button", { name: "Delete" }).first().click();
    
    // Wait for the item to be deleted
    await expect(page.locator(".card").filter({ hasText: "3 L" })).not.toBeVisible();
  });
  
  test.skip("can add a new ingredient", async ({ page }) => {
    // Click the "Add new ingredient" link
    await page.getByText("+ Add new ingredient").click();
    
    // Fill in the new ingredient form
    await page.getByPlaceholder("New ingredient name").fill("Dragon Fruit");
    
    // Click the Add button in the new ingredient form
    // We need to be specific because there are multiple "Add" buttons
    await page.locator('button.bg-blue-600').click();
    
    // The form should switch back to the fridge item form
    // and the new ingredient should be selected
    await expect(page.locator('select[name="ingredient_id"]')).toBeVisible();
    
    // Add a fridge item with the new ingredient
    await page.getByPlaceholder("Quantity").fill("1");
    await page.getByPlaceholder("Unit").fill("pcs");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    
    // Check that the item was added with the new ingredient
    await expect(page.locator(".card").filter({ hasText: "Dragon Fruit" })).toBeVisible();
    
    // Clean up by deleting the item
    await page.getByRole("button", { name: "Delete" }).first().click();
  });
}); 