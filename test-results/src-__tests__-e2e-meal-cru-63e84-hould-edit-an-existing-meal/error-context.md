# Test info

- Name: Meal CRUD E2E >> should edit an existing meal
- Location: /Users/vincent/foodapp/src/__tests__/e2e/meal-crud.spec.ts:57:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.card').first().getByText('Edit')

    at /Users/vincent/foodapp/src/__tests__/e2e/meal-crud.spec.ts:59:59
```

# Page snapshot

```yaml
- complementary:
  - heading "FoodApp" [level=1]
  - navigation:
    - link "Meals":
      - /url: /meals
    - link "Plan":
      - /url: /plan
    - link "Fridge":
      - /url: /fridge
    - link "Health":
      - /url: /health
    - link "Shop":
      - /url: /shopping
- main:
  - heading "Meals" [level=1]
  - paragraph: Browse and manage your meals
  - link "Add New Meal":
    - /url: /meals/new
    - button "Add New Meal"
  - heading "Spaghetti Bolognese" [level=3]
  - paragraph: Classic Italian pasta dish with rich meat sauce
  - text: "0"
  - button "Edit"
  - button "Delete"
  - heading "Vegetable Stir Fry" [level=3]
  - paragraph: Quick and healthy vegetable stir fry with soy sauce
  - text: "0"
  - button "Edit"
  - button "Delete"
  - heading "Test" [level=3]
  - paragraph: test
  - text: "0"
  - button "Edit"
  - button "Delete"
- alert
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Meal CRUD E2E", () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto("/meals");
   6 |   });
   7 |
   8 |   test("should display the meals page", async ({ page }) => {
   9 |     // Check the page title
   10 |     const title = page.locator("h1").filter({ hasText: "Meals" });
   11 |     await expect(title).toBeVisible();
   12 |
   13 |     // Check the add new meal button
   14 |     const addButton = page.getByText("+ Add New Meal");
   15 |     await expect(addButton).toBeVisible();
   16 |   });
   17 |
   18 |   test("should create a new meal", async ({ page }) => {
   19 |     // Click on the add new meal button
   20 |     await page.getByText("+ Add New Meal").click();
   21 |
   22 |     // Wait for the new meal page to load
   23 |     await expect(
   24 |       page.locator("h1").filter({ hasText: "Create New Meal" })
   25 |     ).toBeVisible();
   26 |
   27 |     // Fill in the meal form
   28 |     await page.getByLabel("Name").fill("Test Meal");
   29 |     await page.getByLabel("Description").fill("A test meal for E2E testing");
   30 |     await page.getByLabel("Instructions").fill("1. Test\n2. Test again");
   31 |     await page.getByLabel("Prep Time (minutes)").fill("10");
   32 |     await page.getByLabel("Cook Time (minutes)").fill("20");
   33 |     await page.getByLabel("Servings").fill("4");
   34 |
   35 |     // Add an ingredient (assuming there's at least one ingredient in the system)
   36 |     await page.getByText("Add Ingredient").click();
   37 |
   38 |     // Assuming we have a dropdown for selecting ingredients
   39 |     const ingredientDropdown = page.locator("select").first();
   40 |     await ingredientDropdown.selectOption({ index: 0 }); // Select the first option
   41 |
   42 |     await page.getByLabel("Quantity").fill("100");
   43 |     await page.locator("select").nth(1).selectOption("g"); // Select grams as unit
   44 |     await page.getByText("Add to Meal").click();
   45 |
   46 |     // Submit the form
   47 |     await page.getByText("Create Meal").click();
   48 |
   49 |     // Verify redirect to meals page
   50 |     await expect(page.url()).toContain("/meals");
   51 |
   52 |     // Verify the new meal is displayed
   53 |     await expect(page.getByText("Test Meal")).toBeVisible();
   54 |     await expect(page.getByText("A test meal for E2E testing")).toBeVisible();
   55 |   });
   56 |
   57 |   test("should edit an existing meal", async ({ page }) => {
   58 |     // Assuming there's at least one meal displayed
>  59 |     await page.locator(".card").first().getByText("Edit").click();
      |                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
   60 |
   61 |     // Wait for the edit page to load
   62 |     await expect(
   63 |       page.locator("h1").filter({ hasText: "Edit Meal" })
   64 |     ).toBeVisible();
   65 |
   66 |     // Edit the meal name
   67 |     const nameInput = page.getByLabel("Name");
   68 |     await nameInput.clear();
   69 |     await nameInput.fill("Updated Meal Name");
   70 |
   71 |     // Submit the form
   72 |     await page.getByText("Update Meal").click();
   73 |
   74 |     // Verify redirect to meals page
   75 |     await expect(page.url()).toContain("/meals");
   76 |
   77 |     // Verify the updated meal is displayed
   78 |     await expect(page.getByText("Updated Meal Name")).toBeVisible();
   79 |   });
   80 |
   81 |   test("should delete a meal", async ({ page }) => {
   82 |     // Get the total number of meal cards
   83 |     const initialMealCount = await page.locator(".card").count();
   84 |
   85 |     // If there are no meals, we can't test deletion
   86 |     test.skip(initialMealCount === 0, "No meals to delete");
   87 |
   88 |     // Remember the name of the first meal
   89 |     const mealName = await page
   90 |       .locator(".card")
   91 |       .first()
   92 |       .locator("h2")
   93 |       .textContent();
   94 |
   95 |     // Click delete on the first meal
   96 |     await page.locator(".card").first().getByText("Delete").click();
   97 |
   98 |     // Confirm the deletion in the dialog
   99 |     page.on("dialog", (dialog) => dialog.accept());
  100 |
  101 |     // Wait for the meal to be removed
  102 |     await expect(async () => {
  103 |       const currentMealCount = await page.locator(".card").count();
  104 |       expect(currentMealCount).toBe(initialMealCount - 1);
  105 |     }).toPass();
  106 |
  107 |     // Verify the meal name is no longer on the page
  108 |     if (mealName) {
  109 |       await expect(page.getByText(mealName)).not.toBeVisible();
  110 |     }
  111 |   });
  112 | });
  113 |
```