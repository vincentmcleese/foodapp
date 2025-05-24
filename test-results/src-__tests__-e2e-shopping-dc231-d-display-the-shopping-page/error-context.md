# Test info

- Name: Shopping List >> should display the shopping page
- Location: /Users/vincent/foodapp/src/__tests__/e2e/shopping.test.ts:4:7

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:3000/shopping
Call log:
  - navigating to "http://localhost:3000/shopping", waiting until "load"

    at /Users/vincent/foodapp/src/__tests__/e2e/shopping.test.ts:6:16
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Shopping List", () => {
   4 |   test("should display the shopping page", async ({ page }) => {
   5 |     // Navigate to the shopping page
>  6 |     await page.goto("/shopping");
     |                ^ Error: page.goto: net::ERR_ABORTED at http://localhost:3000/shopping
   7 |
   8 |     // Check that the page title is present
   9 |     await expect(page.locator("h1")).toContainText("Shopping List");
  10 |
  11 |     // Check that the page subtitle is present
  12 |     await expect(page.locator("p")).toContainText(
  13 |       "Items needed for your meal plan"
  14 |     );
  15 |   });
  16 |
  17 |   test("should show shopping list items and filter them by status", async ({
  18 |     page,
  19 |     request,
  20 |   }) => {
  21 |     // Navigate to the shopping page
  22 |     await page.goto("/shopping");
  23 |
  24 |     // Wait for the shopping list to load
  25 |     await page.waitForSelector('h2:has-text("Shopping List")');
  26 |
  27 |     // Check that tabs exist
  28 |     await expect(page.locator('button:has-text("All")')).toBeVisible();
  29 |     await expect(page.locator('button:has-text("To Buy")')).toBeVisible();
  30 |     await expect(page.locator('button:has-text("Partial")')).toBeVisible();
  31 |     await expect(page.locator('button:has-text("In Stock")')).toBeVisible();
  32 |
  33 |     // Check that we can click on different tabs
  34 |     await page.click('button:has-text("To Buy")');
  35 |     await page.click('button:has-text("Partial")');
  36 |     await page.click('button:has-text("In Stock")');
  37 |     await page.click('button:has-text("All")');
  38 |
  39 |     // Check that the refresh button works
  40 |     await page.click('button:has-text("Refresh")');
  41 |
  42 |     // Check shopping list is still visible
  43 |     await expect(page.locator('h2:has-text("Shopping List")')).toBeVisible();
  44 |   });
  45 | });
  46 |
```