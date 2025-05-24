import { MealIngredient } from "./api-services";

/**
 * Calculate nutrition totals from a list of meal ingredients
 * @param ingredients List of meal ingredients with their associated ingredient data
 * @returns Object containing total calories, protein, carbs, and fat
 */
export function calculateNutrition(ingredients: MealIngredient[]) {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  ingredients.forEach((item) => {
    if (item.ingredient?.nutrition) {
      // Calculate based on quantity (assuming 100g as the base)
      const multiplier = item.quantity / 100;

      // Add the nutritional values from this ingredient
      if (typeof item.ingredient.nutrition.calories === "number") {
        nutrition.calories += item.ingredient.nutrition.calories * multiplier;
      }

      if (typeof item.ingredient.nutrition.protein === "number") {
        nutrition.protein += item.ingredient.nutrition.protein * multiplier;
      }

      if (typeof item.ingredient.nutrition.carbs === "number") {
        nutrition.carbs += item.ingredient.nutrition.carbs * multiplier;
      }

      if (typeof item.ingredient.nutrition.fat === "number") {
        nutrition.fat += item.ingredient.nutrition.fat * multiplier;
      }
    }
  });

  // Round values to 1 decimal place for better readability
  return {
    calories: Math.round(nutrition.calories * 10) / 10,
    protein: Math.round(nutrition.protein * 10) / 10,
    carbs: Math.round(nutrition.carbs * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
  };
}

/**
 * Format a nutrition value with appropriate units
 * @param value The nutrition value to format
 * @param unit The unit for the value (g, mg, etc.)
 * @returns Formatted string with value and unit
 */
export function formatNutritionValue(
  value: number,
  unit: string = "g"
): string {
  return `${value}${unit}`;
}

/**
 * Calculate the total time for a meal (prep + cooking)
 * @param prepTime Preparation time in minutes
 * @param cookTime Cooking time in minutes
 * @returns Total time in minutes
 */
export function calculateTotalTime(
  prepTime?: number,
  cookTime?: number
): number {
  return (prepTime || 0) + (cookTime || 0);
}

/**
 * Format time duration in minutes to a human-readable string
 * @param minutes Time in minutes
 * @returns Formatted time string (e.g., "1h 30m" or "25m")
 */
export function formatTime(minutes?: number): string {
  if (!minutes) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }

  return `${mins}m`;
}
