import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST a new ingredient to a meal
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Check if the meal exists
    const { data: _, error: mealError } = await supabaseAdmin
      .from("meal")
      .select()
      .eq("id", id)
      .single();

    if (mealError) {
      if (mealError.code === "PGRST116") {
        return NextResponse.json({ error: "Meal not found" }, { status: 404 });
      }
      throw mealError;
    }

    // Add the ingredient to the meal
    const { data, error } = await supabaseAdmin
      .from("meal_ingredient")
      .insert({
        meal_id: id,
        ingredient_id: body.ingredient_id,
        quantity: body.quantity,
        unit: body.unit,
      })
      .select(
        `
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      `
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `Error adding ingredient to meal ${context.params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to add ingredient to meal" },
      { status: 500 }
    );
  }
}
