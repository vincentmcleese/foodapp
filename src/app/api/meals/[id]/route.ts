import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateNutrition } from "@/lib/meal";

// GET a single meal by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      console.error(`Error fetching meal ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch meal" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    // Calculate nutrition based on ingredients
    const ingredients = data.meal_ingredient || [];
    const nutrition = calculateNutrition(ingredients);

    return NextResponse.json({
      ...data,
      ingredients,
      nutrition,
    });
  } catch (error) {
    console.error(`Unexpected error fetching meal:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// UPDATE a meal by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, image_url, nutrition, ingredients } = body;

    // Validate that at least one field is being updated
    if (!name && !description && !image_url && !nutrition && !ingredients) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Start a transaction for the meal update
    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (image_url) updateData.image_url = image_url;
    if (nutrition) updateData.nutrition = nutrition;

    // Update the meal
    const { data, error } = await supabaseAdmin
      .from("meal")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating meal ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to update meal" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    // If ingredients are provided, update the meal_ingredient table
    if (ingredients && ingredients.length > 0) {
      // First, delete all existing meal_ingredients for this meal
      const { error: deleteError } = await supabaseAdmin
        .from("meal_ingredient")
        .delete()
        .eq("meal_id", id);

      if (deleteError) {
        console.error(
          `Error deleting existing meal ingredients for meal ${id}:`,
          deleteError
        );
        return NextResponse.json(
          { error: "Failed to update meal ingredients" },
          { status: 500 }
        );
      }

      // Then, insert the new ingredients
      const mealIngredientsToInsert = ingredients.map(
        (ingredient: {
          ingredient_id: string;
          quantity: number;
          unit: string;
        }) => ({
          meal_id: id,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })
      );

      const { error: insertError } = await supabaseAdmin
        .from("meal_ingredient")
        .insert(mealIngredientsToInsert);

      if (insertError) {
        console.error(
          `Error inserting meal ingredients for meal ${id}:`,
          insertError
        );
        return NextResponse.json(
          { error: "Failed to update meal ingredients" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Unexpected error updating meal:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE a meal by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First delete related meal_ingredients
    const { error: deleteIngredientsError } = await supabaseAdmin
      .from("meal_ingredient")
      .delete()
      .eq("meal_id", id);

    if (deleteIngredientsError) {
      console.error(
        `Error deleting meal ingredients for meal ${id}:`,
        deleteIngredientsError
      );
      return NextResponse.json(
        { error: "Failed to delete meal ingredients" },
        { status: 500 }
      );
    }

    // Then delete the meal
    const { error } = await supabaseAdmin.from("meal").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting meal ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to delete meal" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Unexpected error deleting meal:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
