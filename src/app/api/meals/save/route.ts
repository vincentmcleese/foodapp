import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface MealData {
  name: string;
  description?: string;
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  cuisine?: string;
  nutrition?: Record<string, number>;
  ingredients?: MealIngredient[];
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const mealData = (await request.json()) as MealData;

    if (!mealData || !mealData.name) {
      return NextResponse.json({ error: "Invalid meal data" }, { status: 400 });
    }

    // Extract ingredients from the meal data
    const ingredients = mealData.ingredients || [];

    // Prepare meal data for insertion (without ingredients)
    const { ingredients: _, ...mealDataWithoutIngredients } = mealData;

    // Add AI generated flag
    const mealToInsert = {
      name: mealDataWithoutIngredients.name,
      description: mealDataWithoutIngredients.description,
      instructions: mealDataWithoutIngredients.instructions,
      prep_time: mealDataWithoutIngredients.prepTime,
      cook_time: mealDataWithoutIngredients.cookTime,
      servings: mealDataWithoutIngredients.servings,
      cuisine: mealDataWithoutIngredients.cuisine,
      nutrition: mealDataWithoutIngredients.nutrition,
      source: "ai",
      ai_generated: true,
    };

    // Insert the meal and get the ID
    const { data: insertedMeal, error: mealError } = await supabaseAdmin
      .from("meal")
      .insert(mealToInsert)
      .select()
      .single();

    if (mealError) {
      console.error("Error inserting meal:", mealError);
      return NextResponse.json(
        { error: "Failed to save meal" },
        { status: 500 }
      );
    }

    // Process ingredients if they exist
    if (ingredients.length > 0) {
      // First, check if ingredients exist in the database
      const ingredientNames = ingredients.map(
        (ing: MealIngredient) => ing.name
      );

      // Get existing ingredients
      const { data: existingIngredients, error: ingredientError } =
        await supabaseAdmin
          .from("ingredient")
          .select("id, name")
          .in("name", ingredientNames);

      if (ingredientError) {
        console.error("Error fetching ingredients:", ingredientError);
        return NextResponse.json(
          { error: "Failed to process ingredients" },
          { status: 500 }
        );
      }

      // Create a map of existing ingredient names to their IDs
      const existingIngredientMap = new Map<string, string>();
      (existingIngredients || []).forEach(
        (ing: { id: string; name: string }) => {
          existingIngredientMap.set(ing.name.toLowerCase(), ing.id);
        }
      );

      // Find missing ingredients that need to be created
      const missingIngredients = ingredients.filter(
        (ing: MealIngredient) =>
          !existingIngredientMap.has(ing.name.toLowerCase())
      );

      // Insert missing ingredients
      if (missingIngredients.length > 0) {
        const ingredientsToInsert = missingIngredients.map(
          (ing: MealIngredient) => ({
            name: ing.name,
            // Add default nutrition data or leave empty for now
            nutrition: null,
          })
        );

        const { data: newIngredients, error: insertError } = await supabaseAdmin
          .from("ingredient")
          .upsert(ingredientsToInsert)
          .select("id, name");

        if (insertError) {
          console.error("Error inserting new ingredients:", insertError);
          return NextResponse.json(
            { error: "Failed to create new ingredients" },
            { status: 500 }
          );
        }

        // Add newly created ingredients to the map
        (newIngredients || []).forEach((ing: { id: string; name: string }) => {
          existingIngredientMap.set(ing.name.toLowerCase(), ing.id);
        });
      }

      // Create meal_ingredient entries
      const mealIngredients = ingredients.map((ing: MealIngredient) => ({
        meal_id: insertedMeal.id,
        ingredient_id: existingIngredientMap.get(ing.name.toLowerCase()),
        quantity: ing.quantity,
        unit: ing.unit,
      }));

      const { error: mealIngredientError } = await supabaseAdmin
        .from("meal_ingredient")
        .insert(mealIngredients);

      if (mealIngredientError) {
        console.error("Error inserting meal ingredients:", mealIngredientError);
        return NextResponse.json(
          { error: "Failed to save meal ingredients" },
          { status: 500 }
        );
      }
    }

    // Return successful response with the meal ID
    return NextResponse.json({
      success: true,
      mealId: insertedMeal.id,
      message: "Meal saved successfully",
    });
  } catch (error) {
    console.error("Error saving meal:", error);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}
