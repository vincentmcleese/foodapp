import {
  MealIngredient,
  FridgeItem,
  Meal,
  RecommendationRequest,
} from "./api-services";

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
 * Calculate percentage of meal ingredients available in fridge
 * @param mealIngredients List of meal ingredients
 * @param fridgeItems List of fridge items
 * @returns Percentage of ingredients available (0-100)
 */
export function calculateFridgePercentage(
  mealIngredients: MealIngredient[],
  fridgeItems: FridgeItem[]
): number {
  if (!mealIngredients?.length) return 0;

  // Create a map of fridge items by ingredient ID
  const fridgeMap = new Map(
    fridgeItems.map((item) => [item.ingredient_id, item])
  );

  // Count ingredients available in fridge
  const availableCount = mealIngredients.filter((mi) => {
    const fridgeItem = fridgeMap.get(mi.ingredient_id);

    // For pantry items, check if in stock
    if (mi.ingredient?.ingredient_type === "pantry") {
      return fridgeItem?.status === "IN_STOCK";
    }

    // For regular ingredients, check if available and has sufficient quantity
    return fridgeItem && (fridgeItem.quantity || 0) >= mi.quantity;
  }).length;

  return Math.round((availableCount / mealIngredients.length) * 100);
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
 * Format time into a human-readable format (e.g., "1h 20m")
 * @param minutes Time in minutes
 * @returns Formatted time string
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Apply filters and sorting to a list of meals
 * @param meals List of meals to filter and sort
 * @param options Filter and sort options
 * @param fridgeItems Optional list of fridge items for percentage calculation
 * @returns Filtered and sorted list of meals
 */
export function applyMealFilters(
  meals: Meal[],
  options: RecommendationRequest,
  fridgeItems?: FridgeItem[]
): Meal[] {
  if (!meals || !meals.length) return [];

  let filtered = [...meals];

  // Filter by health principles
  if (options.healthPrinciples && options.healthPrinciples.length > 0) {
    filtered = filtered.filter((meal) =>
      meal.healthPrinciples?.some((hp) =>
        options.healthPrinciples?.includes(hp.id)
      )
    );
  }

  // Apply sorting
  if (options.sortBy) {
    if (options.sortBy === "fridgePercentage" && fridgeItems?.length) {
      // First calculate percentages for all meals
      const mealsWithPercentages = filtered.map((meal) => {
        let percentage = 0;
        if (meal.meal_ingredient?.length) {
          percentage = calculateFridgePercentage(
            meal.meal_ingredient,
            fridgeItems
          );
        }
        return { meal, percentage };
      });

      // Sort by percentage (highest first)
      mealsWithPercentages.sort((a, b) => b.percentage - a.percentage);

      // Return just the meals in sorted order
      filtered = mealsWithPercentages.map((item) => item.meal);
    } else if (options.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (options.sortBy === "created") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }
  }

  return filtered;
}
