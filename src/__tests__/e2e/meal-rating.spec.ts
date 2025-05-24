import { test, expect } from "@playwright/test";

test.describe("Meal Rating Feature", () => {
  test("should allow users to rate meals", async ({ page }) => {
    // Navigate to the meals page
    await page.goto("/meals");

    // Click on the first meal to view its details
    await page.click(".meal-card:first-child");

    // Verify that we're on the meal details page
    await expect(page.locator("h1")).toBeVisible();

    // Verify that the rating component is visible
    await expect(page.getByText("Rate this meal")).toBeVisible();

    // Get the initial likes count
    const initialLikesText = await page
      .locator("button", { hasText: "Like" })
      .textContent();
    const initialLikes = initialLikesText
      ? parseInt(initialLikesText.match(/\d+/)?.[0] || "0")
      : 0;

    // Click the Like button
    await page.click("button:has-text('Like')");

    // Wait for the rating to be processed
    await page.waitForTimeout(1000);

    // Verify that the likes count has increased
    const updatedLikesText = await page
      .locator("button", { hasText: "Like" })
      .textContent();
    const updatedLikes = updatedLikesText
      ? parseInt(updatedLikesText.match(/\d+/)?.[0] || "0")
      : 0;

    expect(updatedLikes).toBeGreaterThan(initialLikes);

    // Verify that the success toast is shown
    await expect(page.getByText("Thanks for liking this meal!")).toBeVisible();

    // Verify that confetti animation appears (would require additional testing in a real environment)

    // Go back to the meals page
    await page.click("button:has-text('Back to Meals')");

    // Verify that we're back on the meals page
    await expect(page.url()).toContain("/meals");

    // Verify the compact rating shows on the meal card
    await expect(
      page.locator(".meal-card:first-child").getByRole("button")
    ).toBeVisible();
  });
});
