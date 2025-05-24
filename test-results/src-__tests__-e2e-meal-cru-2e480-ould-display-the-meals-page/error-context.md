# Test info

- Name: Meal CRUD E2E >> should display the meals page
- Location: /Users/vincent/foodapp/src/__tests__/e2e/meal-crud.spec.ts:8:7

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/meals", waiting until "load"

    at /Users/vincent/foodapp/src/__tests__/e2e/meal-crud.spec.ts:5:16
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Meal CRUD E2E", () => {
   4 |   test.beforeEach(async ({ page }) => {
>  5 |     await page.goto("/meals");
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
   6 |   });
   7 |
   8 |   test("should display the meals page", async ({ page }) => {
   9 |     // Check the page title
  10 |     await expect(page.getByRole("heading", { name: "Meals" })).toBeVisible();
  11 |
  12 |     // Check the add new meal button
  13 |     const addButton = page.getByRole("button", { name: "Add New Meal" });
  14 |     await expect(addButton).toBeVisible();
  15 |   });
  16 |
  17 |   test("should create a new meal", async ({ page }) => {
  18 |     // Click on the add new meal button
  19 |     await page.getByRole("button", { name: "Add New Meal" }).click();
  20 |
  21 |     // Wait for the new meal page to load
  22 |     await expect(
  23 |       page.getByRole("heading", { name: "Create New Meal" })
  24 |     ).toBeVisible();
  25 |
  26 |     // Fill out the form
  27 |     await page.getByLabel("Meal Name").fill("Test Meal E2E");
  28 |     await page
  29 |       .getByLabel("Description")
  30 |       .fill("A test meal created in E2E test");
  31 |     await page.getByLabel("Prep Time").fill("10");
  32 |     await page.getByLabel("Cook Time").fill("20");
  33 |     await page.getByLabel("Servings").fill("4");
  34 |
  35 |     // Add an ingredient
  36 |     await page.getByLabel("Quantity").fill("100");
  37 |     await page.getByRole("button", { name: "Add Ingredient" }).click();
  38 |
  39 |     // Submit the form
  40 |     await page.getByRole("button", { name: "Create Meal" }).click();
  41 |
  42 |     // Should redirect back to meals page
  43 |     await expect(page.getByRole("heading", { name: "Meals" })).toBeVisible();
  44 |
  45 |     // The new meal should be visible in the list
  46 |     await expect(page.getByText("Test Meal E2E")).toBeVisible();
  47 |     await expect(
  48 |       page.getByText("A test meal created in E2E test")
  49 |     ).toBeVisible();
  50 |   });
  51 |
  52 |   test("should edit an existing meal", async ({ page }) => {
  53 |     // Assuming there's at least one meal displayed
  54 |     await page.getByRole("button", { name: "Edit" }).first().click();
  55 |
  56 |     // Wait for the edit page to load
  57 |     await expect(
  58 |       page.getByRole("heading", { name: "Edit Meal" })
  59 |     ).toBeVisible();
  60 |
  61 |     // Clear and update the name
  62 |     await page.getByLabel("Meal Name").fill("");
  63 |     await page.getByLabel("Meal Name").fill("Updated Meal E2E");
  64 |
  65 |     // Submit the form
  66 |     await page.getByRole("button", { name: "Update Meal" }).click();
  67 |
  68 |     // Should redirect back to meals page
  69 |     await expect(page.getByRole("heading", { name: "Meals" })).toBeVisible();
  70 |
  71 |     // The updated meal should be visible
  72 |     await expect(page.getByText("Updated Meal E2E")).toBeVisible();
  73 |   });
  74 |
  75 |   test.skip("should delete a meal", async ({ page }) => {
  76 |     // Get the number of meals before deletion
  77 |     const initialMealCount = await page.locator(".card").count();
  78 |
  79 |     // Find and click the delete button on the first meal
  80 |     await page.getByRole("button", { name: "Delete" }).first().click();
  81 |
  82 |     // Confirm the deletion
  83 |     page.on("dialog", (dialog) => dialog.accept());
  84 |
  85 |     // Wait for the deletion to process
  86 |     await page.waitForTimeout(1000);
  87 |
  88 |     // Check that we have one fewer meal
  89 |     const newMealCount = await page.locator(".card").count();
  90 |     expect(newMealCount).toBe(initialMealCount - 1);
  91 |   });
  92 | });
  93 |
```