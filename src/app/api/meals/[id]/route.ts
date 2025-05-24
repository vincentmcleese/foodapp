import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateNutrition } from "@/lib/meal";

// GET a single meal by ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { data, error } = await supabaseAdmin
      .from("meal")
      .select(
        `
        *,
        meal_ingredient!meal_id (
          *,
          ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Meal not found" }, { status: 404 });
      }
      console.error(`Error fetching meal ${id}:`, error);
      throw error;
    }

    // Calculate nutrition based on ingredients
    const ingredients = data.meal_ingredient || [];
    const nutrition = calculateNutrition(ingredients);

    return NextResponse.json({
      ...data,
      ingredients: ingredients,
      nutrition,
    });
  } catch (error) {
    console.error(`Error fetching meal ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch meal" },
      { status: 500 }
    );
  }
}

// UPDATE a meal
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Extract ingredients to handle them separately
    const { ingredients: _, ...mealData } = body;

    // Update the meal
    const { data: meal, error: mealError } = await supabaseAdmin
      .from("meal")
      .update(mealData)
      .eq("id", id)
      .select()
      .single();

    if (mealError) {
      if (mealError.code === "PGRST116") {
        return NextResponse.json({ error: "Meal not found" }, { status: 404 });
      }
      throw mealError;
    }

    // Fetch current ingredients to calculate nutrition
    const { data: currentIngredients, error: ingredientsError } =
      await supabaseAdmin
        .from("meal_ingredient")
        .select(
          `
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      `
        )
        .eq("meal_id", id);

    if (ingredientsError) {
      throw ingredientsError;
    }

    // Calculate nutrition based on current ingredients
    const nutrition = calculateNutrition(currentIngredients || []);

    // Return the updated meal with ingredients and nutrition
    return NextResponse.json({
      ...meal,
      ingredients: currentIngredients || [],
      nutrition,
    });
  } catch (error) {
    console.error(`Error updating meal ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

// DELETE a meal
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // First delete all meal ingredients
    const { error: ingredientError } = await supabaseAdmin
      .from("meal_ingredient")
      .delete()
      .eq("meal_id", id);

    if (ingredientError) {
      throw ingredientError;
    }

    // Then delete the meal
    const { error: mealError } = await supabaseAdmin
      .from("meal")
      .delete()
      .eq("id", id);

    if (mealError) {
      throw mealError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting meal ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
