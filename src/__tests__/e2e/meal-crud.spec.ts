import { test, expect } from "@playwright/test";

test.describe("Meal CRUD E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/meals");
  });

  test("should display the meals page", async ({ page }) => {
    // Check the page title
    await expect(page.getByRole("heading", { name: "Meals" })).toBeVisible();

    // Check the add new meal button
    const addButton = page.getByRole("button", { name: "Add New Meal" });
    await expect(addButton).toBeVisible();
  });

  test("should create a new meal", async ({ page }) => {
    // Click on the add new meal button
    await page.getByRole("button", { name: "Add New Meal" }).click();

    // Wait for the new meal page to load
    await expect(
      page.getByRole("heading", { name: "Create New Meal" })
    ).toBeVisible();

    // Fill out the form
    await page.getByLabel("Meal Name").fill("Test Meal E2E");
    await page
      .getByLabel("Description")
      .fill("A test meal created in E2E test");
    await page.getByLabel("Prep Time").fill("10");
    await page.getByLabel("Cook Time").fill("20");
    await page.getByLabel("Servings").fill("4");

    // Add an ingredient
    await page.getByLabel("Quantity").fill("100");
    await page.getByRole("button", { name: "Add Ingredient" }).click();

    // Submit the form
    await page.getByRole("button", { name: "Create Meal" }).click();

    // Should redirect back to meals page
    await expect(page.getByRole("heading", { name: "Meals" })).toBeVisible();

    // The new meal should be visible in the list
    await expect(page.getByText("Test Meal E2E")).toBeVisible();
    await expect(
      page.getByText("A test meal created in E2E test")
    ).toBeVisible();
  });

  test("should edit an existing meal", async ({ page }) => {
    // Assuming there's at least one meal displayed
    await page.getByRole("button", { name: "Edit" }).first().click();

    // Wait for the edit page to load
    await expect(
      page.getByRole("heading", { name: "Edit Meal" })
    ).toBeVisible();

    // Clear and update the name
    await page.getByLabel("Meal Name").fill("");
    await page.getByLabel("Meal Name").fill("Updated Meal E2E");

    // Submit the form
    await page.getByRole("button", { name: "Update Meal" }).click();

    // Should redirect back to meals page
    await expect(page.getByRole("heading", { name: "Meals" })).toBeVisible();

    // The updated meal should be visible
    await expect(page.getByText("Updated Meal E2E")).toBeVisible();
  });

  test.skip("should delete a meal", async ({ page }) => {
    // Get the number of meals before deletion
    const initialMealCount = await page.locator(".card").count();

    // Find and click the delete button on the first meal
    await page.getByRole("button", { name: "Delete" }).first().click();

    // Confirm the deletion
    page.on("dialog", (dialog) => dialog.accept());

    // Wait for the deletion to process
    await page.waitForTimeout(1000);

    // Check that we have one fewer meal
    const newMealCount = await page.locator(".card").count();
    expect(newMealCount).toBe(initialMealCount - 1);
  });
});
