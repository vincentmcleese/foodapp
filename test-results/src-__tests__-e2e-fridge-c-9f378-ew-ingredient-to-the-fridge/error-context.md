# Test info

- Name: Fridge CRUD E2E >> should add a new ingredient to the fridge
- Location: /Users/vincent/foodapp/src/__tests__/e2e/fridge-crud.spec.ts:13:7

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/fridge", waiting until "load"

    at /Users/vincent/foodapp/src/__tests__/e2e/fridge-crud.spec.ts:5:16
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Fridge CRUD E2E", () => {
   4 |   test.beforeEach(async ({ page }) => {
>  5 |     await page.goto("/fridge");
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
   6 |   });
   7 |
   8 |   test("should display the fridge page", async ({ page }) => {
   9 |     // Check the page title
  10 |     await expect(page.getByRole("heading", { name: "Fridge Inventory" })).toBeVisible();
  11 |   });
  12 |
  13 |   test("should add a new ingredient to the fridge", async ({ page }) => {
  14 |     // Fill the add ingredient form
  15 |     await page.getByLabel("Name").fill("Test Banana");
  16 |     await page.getByLabel("Quantity").fill("5");
  17 |     await page.getByLabel("Unit").selectOption("pcs");
  18 |     
  19 |     // Add the ingredient
  20 |     await page.getByRole("button", { name: "Add to Fridge" }).click();
  21 |     
  22 |     // Wait for the ingredient to appear in the list
  23 |     await expect(page.getByText("Test Banana")).toBeVisible();
  24 |     await expect(page.getByText("5 pcs")).toBeVisible();
  25 |   });
  26 |
  27 |   test("should edit an existing ingredient", async ({ page }) => {
  28 |     // First add an ingredient if none exists
  29 |     const ingredientExists = await page.getByText("Test Banana").isVisible();
  30 |     
  31 |     if (!ingredientExists) {
  32 |       // Add a new ingredient
  33 |       await page.getByLabel("Name").fill("Test Banana");
  34 |       await page.getByLabel("Quantity").fill("5");
  35 |       await page.getByLabel("Unit").selectOption("pcs");
  36 |       await page.getByRole("button", { name: "Add to Fridge" }).click();
  37 |       
  38 |       // Wait for the ingredient to appear
  39 |       await expect(page.getByText("Test Banana")).toBeVisible();
  40 |     }
  41 |     
  42 |     // Click the edit button
  43 |     await page.getByRole("button", { name: "Edit" }).first().click();
  44 |     
  45 |     // Update the values
  46 |     await page.getByLabel("Name").fill("Updated Banana");
  47 |     await page.getByLabel("Quantity").fill("10");
  48 |     
  49 |     // Save the changes
  50 |     await page.getByRole("button", { name: "Update" }).click();
  51 |     
  52 |     // Check that the updated values are shown
  53 |     await expect(page.getByText("Updated Banana")).toBeVisible();
  54 |     await expect(page.getByText("10 pcs")).toBeVisible();
  55 |   });
  56 |
  57 |   test("should delete an ingredient", async ({ page }) => {
  58 |     // First add an ingredient if none exists
  59 |     const ingredientExists = await page.getByText("Updated Banana").isVisible()
  60 |       || await page.getByText("Test Banana").isVisible();
  61 |     
  62 |     if (!ingredientExists) {
  63 |       // Add a new ingredient
  64 |       await page.getByLabel("Name").fill("Test Banana");
  65 |       await page.getByLabel("Quantity").fill("5");
  66 |       await page.getByLabel("Unit").selectOption("pcs");
  67 |       await page.getByRole("button", { name: "Add to Fridge" }).click();
  68 |       
  69 |       // Wait for the ingredient to appear
  70 |       await expect(page.getByText("Test Banana")).toBeVisible();
  71 |     }
  72 |     
  73 |     // Get the number of ingredients before deletion
  74 |     const initialCount = await page.locator(".ingredient-card").count();
  75 |     
  76 |     // Click the delete button on the first ingredient
  77 |     await page.getByRole("button", { name: "Delete" }).first().click();
  78 |     
  79 |     // Handle the confirmation dialog
  80 |     page.on("dialog", dialog => dialog.accept());
  81 |     
  82 |     // Wait for the deletion to process
  83 |     await page.waitForTimeout(1000);
  84 |     
  85 |     // Verify we have one fewer ingredient
  86 |     const newCount = await page.locator(".ingredient-card").count();
  87 |     expect(newCount).toBe(initialCount - 1);
  88 |   });
  89 | }); 
```