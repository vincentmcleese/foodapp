# Test info

- Name: Plan CRUD E2E >> should display the plan page
- Location: /Users/vincent/foodapp/src/__tests__/e2e/plan-crud.spec.ts:8:7

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/plan", waiting until "load"

    at /Users/vincent/foodapp/src/__tests__/e2e/plan-crud.spec.ts:5:16
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Plan CRUD E2E", () => {
   4 |   test.beforeEach(async ({ page }) => {
>  5 |     await page.goto("/plan");
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
   6 |   });
   7 |
   8 |   test("should display the plan page", async ({ page }) => {
   9 |     // Check the page title
   10 |     await expect(
   11 |       page.getByRole("heading", { name: "Weekly Meal Plan" })
   12 |     ).toBeVisible();
   13 |
   14 |     // Check the add to plan button
   15 |     const addButton = page.getByRole("button", { name: "Add to Plan" });
   16 |     await expect(addButton).toBeVisible();
   17 |
   18 |     // Check that the calendar structure exists
   19 |     await expect(page.getByText("monday")).toBeVisible();
   20 |     await expect(page.getByText("breakfast")).toBeVisible();
   21 |   });
   22 |
   23 |   test("should add a new plan entry", async ({ page }) => {
   24 |     // Click on an empty slot to add a meal
   25 |     const emptySlots = page.getByText("Add meal");
   26 |     await emptySlots.first().click();
   27 |
   28 |     // Wait for the add page to load
   29 |     await expect(
   30 |       page.getByRole("heading", { name: "Add to Meal Plan" })
   31 |     ).toBeVisible();
   32 |
   33 |     // Select a meal if available
   34 |     const mealSelect = page.locator("#meal");
   35 |     await mealSelect.selectOption({ index: 0 });
   36 |
   37 |     // Submit form
   38 |     await page.getByRole("button", { name: "Add to Plan" }).click();
   39 |
   40 |     // Should redirect back to plan page
   41 |     await expect(
   42 |       page.getByRole("heading", { name: "Weekly Meal Plan" })
   43 |     ).toBeVisible();
   44 |   });
   45 |
   46 |   test("should edit an existing plan entry", async ({ page }) => {
   47 |     // First, check if we need to add an entry
   48 |     const hasEntry =
   49 |       (await page.getByRole("button", { name: "Edit" }).count()) > 0;
   50 |
   51 |     if (!hasEntry) {
   52 |       // Add an entry first
   53 |       const emptySlots = page.getByText("Add meal");
   54 |       await emptySlots.first().click();
   55 |
   56 |       // Select a meal if available
   57 |       const mealSelect = page.locator("#meal");
   58 |       await mealSelect.selectOption({ index: 0 });
   59 |
   60 |       await page.getByRole("button", { name: "Add to Plan" }).click();
   61 |
   62 |       // Wait to return to plan page
   63 |       await expect(
   64 |         page.getByRole("heading", { name: "Weekly Meal Plan" })
   65 |       ).toBeVisible();
   66 |     }
   67 |
   68 |     // Now edit the entry
   69 |     await page.getByRole("button", { name: "Edit" }).first().click();
   70 |
   71 |     // Wait for the edit page to load
   72 |     await expect(
   73 |       page.getByRole("heading", { name: "Edit Plan Entry" })
   74 |     ).toBeVisible();
   75 |
   76 |     // Change the meal type
   77 |     const mealTypeSelect = page.locator("#mealType");
   78 |     await mealTypeSelect.selectOption({ index: 1 });
   79 |
   80 |     // Submit form
   81 |     await page.getByRole("button", { name: "Update Plan" }).click();
   82 |
   83 |     // Should redirect back to plan page
   84 |     await expect(
   85 |       page.getByRole("heading", { name: "Weekly Meal Plan" })
   86 |     ).toBeVisible();
   87 |   });
   88 |
   89 |   test("should delete a plan entry", async ({ page }) => {
   90 |     // First, check if we need to add an entry
   91 |     const hasEntry =
   92 |       (await page.getByRole("button", { name: "Delete" }).count()) > 0;
   93 |
   94 |     if (!hasEntry) {
   95 |       // Add an entry first
   96 |       const emptySlots = page.getByText("Add meal");
   97 |       await emptySlots.first().click();
   98 |
   99 |       // Select a meal if available
  100 |       const mealSelect = page.locator("#meal");
  101 |       await mealSelect.selectOption({ index: 0 });
  102 |
  103 |       await page.getByRole("button", { name: "Add to Plan" }).click();
  104 |
  105 |       // Wait to return to plan page
```