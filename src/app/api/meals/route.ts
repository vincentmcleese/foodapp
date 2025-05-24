import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateNutrition } from "@/lib/meal";

// GET all meals
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("meal").select(`
        *,
        meal_ingredient!meal_id (
          *,
          ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
        )
      `);

    if (error) {
      console.error("Error fetching meals:", error);
      throw error;
    }

    // Transform data and calculate nutrition
    const meals = data.map((meal) => {
      const ingredients = meal.meal_ingredient || [];
      const nutrition = calculateNutrition(ingredients);

      return {
        ...meal,
        ingredients: ingredients,
        nutrition,
      };
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

// POST a new meal
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract ingredients to add them separately
    const { ingredients, ...mealData } = body;

    // First, insert the meal
    const { data: meal, error: mealError } = await supabaseAdmin
      .from("meal")
      .insert(mealData)
      .select()
      .single();

    if (mealError) {
      throw mealError;
    }

    // If there are ingredients, add them
    let mealIngredients = [];
    if (ingredients && ingredients.length > 0) {
      const ingredientsToInsert = ingredients.map(
        (ingredient: {
          ingredient_id: string;
          quantity: number;
          unit: string;
        }) => ({
          meal_id: meal.id,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })
      );

      const { data: insertedIngredients, error: ingredientsError } =
        await supabaseAdmin.from("meal_ingredient").insert(ingredientsToInsert)
          .select(`
          *,
          ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
        `);

      if (ingredientsError) {
        throw ingredientsError;
      }

      mealIngredients = insertedIngredients;
    }

    // Calculate nutrition based on ingredients
    const nutrition = calculateNutrition(mealIngredients);

    // Return the complete meal with ingredients and nutrition
    return NextResponse.json({
      ...meal,
      ingredients: mealIngredients,
      nutrition,
    });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}
