import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateNutrition } from "@/lib/meal";

// GET all meals
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const healthPrinciples = url.searchParams.getAll("healthPrinciples");
    const sortBy = url.searchParams.get("sortBy");

    // Start building the query
    let query = supabaseAdmin.from("meal").select(`
      *,
      meal_ingredient!meal_id (
        *,
        ingredient (
          id,
          name,
          ingredient_type,
          nutrition
        )
      ),
      meal_health_principle!meal_id (
        health_principle_id,
        health_principle (
          id,
          name,
          description,
          enabled
        )
      )
    `);

    // Filter by health principles if specified
    if (healthPrinciples && healthPrinciples.length > 0) {
      // We need to join with meal_health_principle and filter
      query = query.in(
        "meal_health_principle.health_principle_id",
        healthPrinciples
      );
    }

    // Execute the query
    const { data: meals, error } = await query;

    if (error) {
      console.error("Error fetching meals:", error);
      return NextResponse.json(
        { error: "Failed to fetch meals" },
        { status: 500 }
      );
    }

    // Process meals to include proper nutrition data and health principles
    const processedMeals = meals.map((meal) => {
      // Process meal ingredients
      const mealIngredients = meal.meal_ingredient || [];

      // Calculate nutrition based on ingredients
      const nutrition = calculateNutrition(mealIngredients);

      // Format health principles
      const healthPrinciples = (meal.meal_health_principle || []).map(
        (hp: any) => hp.health_principle
      );

      // Return processed meal data
      return {
        ...meal,
        nutrition: meal.nutrition || nutrition,
        healthPrinciples: healthPrinciples,
        meal_health_principle: undefined, // Remove this from the response
      };
    });

    // Handle sorting
    if (sortBy === "name") {
      processedMeals.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "created") {
      processedMeals.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }
    // Note: fridgePercentage sorting is done client-side since it needs fridge data

    return NextResponse.json(processedMeals);
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
    const { ingredients, healthPrinciples, ...mealData } = body;

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

    // If there are health principles, add them
    if (healthPrinciples && healthPrinciples.length > 0) {
      const healthPrinciplesToInsert = healthPrinciples.map(
        (principleId: string) => ({
          meal_id: meal.id,
          health_principle_id: principleId,
        })
      );

      const { error: healthPrinciplesError } = await supabaseAdmin
        .from("meal_health_principle")
        .insert(healthPrinciplesToInsert);

      if (healthPrinciplesError) {
        console.error(
          "Error adding health principles to meal:",
          healthPrinciplesError
        );
        // We don't throw here as the meal was successfully created
      }
    }

    // Calculate nutrition based on ingredients
    const nutrition = calculateNutrition(mealIngredients);

    // Return the complete meal with ingredients and nutrition
    return NextResponse.json({
      ...meal,
      ingredients: mealIngredients,
      nutrition,
      healthPrinciples: healthPrinciples || [],
    });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}
