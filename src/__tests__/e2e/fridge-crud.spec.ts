import { test, expect } from "@playwright/test";

test.describe("Fridge CRUD E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fridge");
  });

  test("should display the fridge page", async ({ page }) => {
    // Check the page title
    await expect(page.getByRole("heading", { name: "Fridge Inventory" })).toBeVisible();
  });

  test("should add a new ingredient to the fridge", async ({ page }) => {
    // Fill the add ingredient form
    await page.getByLabel("Name").fill("Test Banana");
    await page.getByLabel("Quantity").fill("5");
    await page.getByLabel("Unit").selectOption("pcs");
    
    // Add the ingredient
    await page.getByRole("button", { name: "Add to Fridge" }).click();
    
    // Wait for the ingredient to appear in the list
    await expect(page.getByText("Test Banana")).toBeVisible();
    await expect(page.getByText("5 pcs")).toBeVisible();
  });

  test("should edit an existing ingredient", async ({ page }) => {
    // First add an ingredient if none exists
    const ingredientExists = await page.getByText("Test Banana").isVisible();
    
    if (!ingredientExists) {
      // Add a new ingredient
      await page.getByLabel("Name").fill("Test Banana");
      await page.getByLabel("Quantity").fill("5");
      await page.getByLabel("Unit").selectOption("pcs");
      await page.getByRole("button", { name: "Add to Fridge" }).click();
      
      // Wait for the ingredient to appear
      await expect(page.getByText("Test Banana")).toBeVisible();
    }
    
    // Click the edit button
    await page.getByRole("button", { name: "Edit" }).first().click();
    
    // Update the values
    await page.getByLabel("Name").fill("Updated Banana");
    await page.getByLabel("Quantity").fill("10");
    
    // Save the changes
    await page.getByRole("button", { name: "Update" }).click();
    
    // Check that the updated values are shown
    await expect(page.getByText("Updated Banana")).toBeVisible();
    await expect(page.getByText("10 pcs")).toBeVisible();
  });

  test("should delete an ingredient", async ({ page }) => {
    // First add an ingredient if none exists
    const ingredientExists = await page.getByText("Updated Banana").isVisible()
      || await page.getByText("Test Banana").isVisible();
    
    if (!ingredientExists) {
      // Add a new ingredient
      await page.getByLabel("Name").fill("Test Banana");
      await page.getByLabel("Quantity").fill("5");
      await page.getByLabel("Unit").selectOption("pcs");
      await page.getByRole("button", { name: "Add to Fridge" }).click();
      
      // Wait for the ingredient to appear
      await expect(page.getByText("Test Banana")).toBeVisible();
    }
    
    // Get the number of ingredients before deletion
    const initialCount = await page.locator(".ingredient-card").count();
    
    // Click the delete button on the first ingredient
    await page.getByRole("button", { name: "Delete" }).first().click();
    
    // Handle the confirmation dialog
    page.on("dialog", dialog => dialog.accept());
    
    // Wait for the deletion to process
    await page.waitForTimeout(1000);
    
    // Verify we have one fewer ingredient
    const newCount = await page.locator(".ingredient-card").count();
    expect(newCount).toBe(initialCount - 1);
  });
}); 