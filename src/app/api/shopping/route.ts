import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface Ingredient {
  id: string;
  name: string;
}

interface MealIngredient {
  id: string;
  quantity: number;
  unit: string;
  ingredient: Ingredient;
}

interface Meal {
  id: string;
  name: string;
  ingredients: MealIngredient[];
}

interface PlanEntry {
  id: string;
  meal_id: string;
  meal: Meal;
}

interface FridgeItem {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient: Ingredient;
}

interface RequiredIngredient {
  id: string;
  name: string;
  required: number;
  unit: string;
  inStock: number;
  status: "need-to-buy" | "partial" | "in-stock";
}

export async function GET() {
  try {
    // 1. First get all plan entries - use meal_plan instead of plan_entry
    const { data: planEntries, error: planError } = await supabaseAdmin
      .from("meal_plan")
      .select("*");

    if (planError) {
      console.error("Error fetching plan entries:", planError);
      return NextResponse.json(
        { error: "Failed to fetch plan entries" },
        { status: 500 }
      );
    }

    // 2. Get meals for plan entries
    const mealIds = planEntries.map((entry) => entry.meal_id).filter(Boolean);

    if (mealIds.length === 0) {
      // No meal plans, return empty shopping list
      return NextResponse.json({
        shoppingList: [],
        totalItems: 0,
        needToBuy: 0,
        partial: 0,
        inStock: 0,
      });
    }

    const { data: meals, error: mealsError } = await supabaseAdmin
      .from("meal")
      .select("id, name")
      .in("id", mealIds);

    if (mealsError) {
      console.error("Error fetching meals:", mealsError);
      return NextResponse.json(
        { error: "Failed to fetch meals" },
        { status: 500 }
      );
    }

    // 3. Get meal ingredients
    const { data: mealIngredients, error: mealIngredientsError } =
      await supabaseAdmin
        .from("meal_ingredient")
        .select(
          `
        id, 
        meal_id, 
        ingredient_id, 
        quantity, 
        unit
      `
        )
        .in("meal_id", mealIds);

    if (mealIngredientsError) {
      console.error("Error fetching meal ingredients:", mealIngredientsError);
      return NextResponse.json(
        { error: "Failed to fetch meal ingredients" },
        { status: 500 }
      );
    }

    // 4. Get ingredient details
    const ingredientIds = mealIngredients
      .map((mi) => mi.ingredient_id)
      .filter(Boolean);

    if (ingredientIds.length === 0) {
      // No ingredients needed
      return NextResponse.json({
        shoppingList: [],
        totalItems: 0,
        needToBuy: 0,
        partial: 0,
        inStock: 0,
      });
    }

    const { data: ingredients, error: ingredientsError } = await supabaseAdmin
      .from("ingredient")
      .select("id, name")
      .in("id", ingredientIds);

    if (ingredientsError) {
      console.error("Error fetching ingredients:", ingredientsError);
      return NextResponse.json(
        { error: "Failed to fetch ingredients" },
        { status: 500 }
      );
    }

    // 5. Get fridge inventory
    const { data: fridgeItems, error: fridgeError } = await supabaseAdmin.from(
      "fridge_item"
    ).select(`
        id,
        ingredient_id,
        quantity,
        unit
      `);

    if (fridgeError) {
      console.error("Error fetching fridge items:", fridgeError);
      return NextResponse.json(
        { error: "Failed to fetch fridge items" },
        { status: 500 }
      );
    }

    // 6. Build the meal data structure manually
    const mealsMap = new Map();
    meals.forEach((meal) => {
      mealsMap.set(meal.id, {
        ...meal,
        ingredients: [],
      });
    });

    // Add ingredients to meals
    mealIngredients.forEach((mi) => {
      const meal = mealsMap.get(mi.meal_id);
      if (!meal) return;

      const ingredient = ingredients.find((ing) => ing.id === mi.ingredient_id);
      if (!ingredient) return;

      meal.ingredients.push({
        id: mi.id,
        quantity: mi.quantity,
        unit: mi.unit,
        ingredient: ingredient,
      });
    });

    // Add meals to plan entries
    const planEntriesWithMeals = planEntries
      .map((entry) => {
        return {
          ...entry,
          meal: mealsMap.get(entry.meal_id) || null,
        };
      })
      .filter((entry) => entry.meal);

    // 7. Aggregate ingredients from all meal plans
    const requiredIngredients: Record<string, RequiredIngredient> = {};

    // Process all plan entries with their meals
    planEntriesWithMeals.forEach((entry: PlanEntry) => {
      if (entry.meal && entry.meal.ingredients) {
        entry.meal.ingredients.forEach((mealIngredient: MealIngredient) => {
          const ingredient = mealIngredient.ingredient;
          if (!ingredient) return;

          const key = ingredient.id;

          if (!requiredIngredients[key]) {
            requiredIngredients[key] = {
              id: ingredient.id,
              name: ingredient.name,
              required: 0,
              unit: mealIngredient.unit,
              inStock: 0,
              status: "need-to-buy",
            };
          }

          // Add to required quantity
          requiredIngredients[key].required += mealIngredient.quantity;
        });
      }
    });

    // 8. Compare with fridge inventory
    fridgeItems.forEach((fridgeItem) => {
      const ingredientId = fridgeItem.ingredient_id;

      if (requiredIngredients[ingredientId]) {
        // For simplicity, we assume same units or handle conversion here
        requiredIngredients[ingredientId].inStock += fridgeItem.quantity;

        // Update status based on available quantity
        if (
          requiredIngredients[ingredientId].inStock >=
          requiredIngredients[ingredientId].required
        ) {
          requiredIngredients[ingredientId].status = "in-stock";
        } else if (requiredIngredients[ingredientId].inStock > 0) {
          requiredIngredients[ingredientId].status = "partial";
        }
      }
    });

    // 9. Convert to array and return
    const shoppingList = Object.values(requiredIngredients);

    return NextResponse.json({
      shoppingList,
      totalItems: shoppingList.length,
      needToBuy: shoppingList.filter((item) => item.status === "need-to-buy")
        .length,
      partial: shoppingList.filter((item) => item.status === "partial").length,
      inStock: shoppingList.filter((item) => item.status === "in-stock").length,
    });
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    );
  }
}
