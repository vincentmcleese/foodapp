import { test, expect } from "@playwright/test";

test.describe("Plan CRUD E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/plan");
  });

  test("should display the plan page", async ({ page }) => {
    // Check the page title
    await expect(
      page.getByRole("heading", { name: "Weekly Meal Plan" })
    ).toBeVisible();

    // Check the add to plan button
    const addButton = page.getByRole("button", { name: "Add to Plan" });
    await expect(addButton).toBeVisible();

    // Check that the calendar structure exists
    await expect(page.getByText("monday")).toBeVisible();
    await expect(page.getByText("breakfast")).toBeVisible();
  });

  test("should add a new plan entry", async ({ page }) => {
    // Click on an empty slot to add a meal
    const emptySlots = page.getByText("Add meal");
    await emptySlots.first().click();

    // Wait for the add page to load
    await expect(
      page.getByRole("heading", { name: "Add to Meal Plan" })
    ).toBeVisible();

    // Select a meal if available
    const mealSelect = page.locator("#meal");
    await mealSelect.selectOption({ index: 0 });

    // Submit form
    await page.getByRole("button", { name: "Add to Plan" }).click();

    // Should redirect back to plan page
    await expect(
      page.getByRole("heading", { name: "Weekly Meal Plan" })
    ).toBeVisible();
  });

  test("should edit an existing plan entry", async ({ page }) => {
    // First, check if we need to add an entry
    const hasEntry =
      (await page.getByRole("button", { name: "Edit" }).count()) > 0;

    if (!hasEntry) {
      // Add an entry first
      const emptySlots = page.getByText("Add meal");
      await emptySlots.first().click();

      // Select a meal if available
      const mealSelect = page.locator("#meal");
      await mealSelect.selectOption({ index: 0 });

      await page.getByRole("button", { name: "Add to Plan" }).click();

      // Wait to return to plan page
      await expect(
        page.getByRole("heading", { name: "Weekly Meal Plan" })
      ).toBeVisible();
    }

    // Now edit the entry
    await page.getByRole("button", { name: "Edit" }).first().click();

    // Wait for the edit page to load
    await expect(
      page.getByRole("heading", { name: "Edit Plan Entry" })
    ).toBeVisible();

    // Change the meal type
    const mealTypeSelect = page.locator("#mealType");
    await mealTypeSelect.selectOption({ index: 1 });

    // Submit form
    await page.getByRole("button", { name: "Update Plan" }).click();

    // Should redirect back to plan page
    await expect(
      page.getByRole("heading", { name: "Weekly Meal Plan" })
    ).toBeVisible();
  });

  test("should delete a plan entry", async ({ page }) => {
    // First, check if we need to add an entry
    const hasEntry =
      (await page.getByRole("button", { name: "Delete" }).count()) > 0;

    if (!hasEntry) {
      // Add an entry first
      const emptySlots = page.getByText("Add meal");
      await emptySlots.first().click();

      // Select a meal if available
      const mealSelect = page.locator("#meal");
      await mealSelect.selectOption({ index: 0 });

      await page.getByRole("button", { name: "Add to Plan" }).click();

      // Wait to return to plan page
      await expect(
        page.getByRole("heading", { name: "Weekly Meal Plan" })
      ).toBeVisible();
    }

    // Count entries before deletion
    const beforeCount = await page
      .getByRole("button", { name: "Delete" })
      .count();

    // Delete the entry
    page.on("dialog", (dialog) => dialog.accept()); // Handle confirmation
    await page.getByRole("button", { name: "Delete" }).first().click();

    // Wait for deletion to process
    await page.waitForTimeout(1000);

    // Count entries after deletion
    const afterCount = await page
      .getByRole("button", { name: "Delete" })
      .count();

    // Should have one fewer entry
    expect(afterCount).toBe(beforeCount - 1);
  });
});
