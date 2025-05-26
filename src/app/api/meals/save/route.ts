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
  healthPrincipleIds?: string[];
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

    // Extract health principle IDs
    const healthPrincipleIds = mealData.healthPrincipleIds || [];

    // Prepare meal data for insertion (without ingredients and health principles)
    const {
      ingredients: _,
      healthPrincipleIds: __,
      ...mealDataWithoutRelations
    } = mealData;

    // Add AI generated flag
    const mealToInsert = {
      name: mealDataWithoutRelations.name,
      description: mealDataWithoutRelations.description,
      instructions: mealDataWithoutRelations.instructions,
      prep_time: mealDataWithoutRelations.prepTime,
      cook_time: mealDataWithoutRelations.cookTime,
      servings: mealDataWithoutRelations.servings,
      cuisine: mealDataWithoutRelations.cuisine,
      nutrition: mealDataWithoutRelations.nutrition,
      source: "ai",
      ai_generated: true,
    };

    // Note: We're temporarily removing image_status until the DB schema is updated

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

    // Schedule image generation in the background
    setTimeout(async () => {
      try {
        const fullUrl = new URL(
          "/api/meals/generate-image",
          request.url
        ).toString();

        await fetch(fullUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealId: insertedMeal.id,
            name: insertedMeal.name,
          }),
        });

        console.log(
          `Image generation requested for meal: ${insertedMeal.name}`
        );
      } catch (error) {
        console.error(
          `Error requesting image generation for meal ${insertedMeal.name}:`,
          error
        );
        // Non-blocking - we continue with the response
      }
    }, 100); // Small delay to ensure response is sent first

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
            // Set default image status to pending
            image_status: "pending",
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

        // Add newly created ingredients to the map and track them for image generation
        const newIngredientsToProcess: Array<{ id: string; name: string }> = [];
        for (const ing of newIngredients || []) {
          existingIngredientMap.set(ing.name.toLowerCase(), ing.id);
          newIngredientsToProcess.push({
            id: ing.id,
            name: ing.name,
          });
        }

        // Request image generation for new ingredients (non-blocking)
        setTimeout(async () => {
          try {
            for (const ing of newIngredientsToProcess) {
              const fullUrl = new URL(
                "/api/ingredients/generate-image",
                request.url
              ).toString();

              await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ingredientId: ing.id,
                  name: ing.name,
                }),
              });

              console.log(
                `Image generation requested for ingredient: ${ing.name}`
              );
            }
          } catch (error) {
            console.error(
              "Error requesting ingredient image generation:",
              error
            );
            // Non-blocking - we continue with the response
          }
        }, 100);
      }

      // Create meal_ingredient relationships
      const mealIngredients = ingredients
        .map((ing: MealIngredient) => {
          const ingredientId = existingIngredientMap.get(
            ing.name.toLowerCase()
          );
          if (!ingredientId) {
            console.error(`Ingredient ID not found for: ${ing.name}`);
            return null;
          }

          return {
            meal_id: insertedMeal.id,
            ingredient_id: ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
          };
        })
        .filter(Boolean); // Remove any null entries

      if (mealIngredients.length > 0) {
        const { error: relError } = await supabaseAdmin
          .from("meal_ingredient")
          .insert(mealIngredients);

        if (relError) {
          console.error("Error creating meal_ingredient relations:", relError);
          return NextResponse.json(
            { error: "Failed to link ingredients to meal" },
            { status: 500 }
          );
        }
      }
    }

    // Process health principles if they exist
    if (healthPrincipleIds.length > 0) {
      // Create meal_health_principle relationships
      const mealHealthPrinciples = healthPrincipleIds.map(
        (principleId: string) => ({
          meal_id: insertedMeal.id,
          health_principle_id: principleId,
        })
      );

      const { error: healthPrincipleError } = await supabaseAdmin
        .from("meal_health_principle")
        .insert(mealHealthPrinciples);

      if (healthPrincipleError) {
        console.error(
          "Error creating meal_health_principle relations:",
          healthPrincipleError
        );
        // We don't return an error here because the meal was already created successfully
        // Just log the error and continue
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
