import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/ingredients/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Always await params before accessing properties
  const { id } = await params;

  try {
    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch ingredient" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient" },
      { status: 500 }
    );
  }
}

// PUT /api/ingredients/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Always await params before accessing properties
  const { id } = await params;
  const body = await request.json();

  try {
    // Update the ingredient
    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update ingredient" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 }
    );
  }
}

// DELETE /api/ingredients/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Always await params before accessing properties
  const { id } = await params;

  try {
    // First check if the ingredient is used in any meals
    const { data: mealIngredient, error: checkError } = await supabaseAdmin
      .from("meal_ingredient")
      .select()
      .eq("ingredient_id", id)
      .limit(1)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking meal ingredients:", checkError);
      return NextResponse.json(
        { error: "Internal server error", success: false },
        { status: 500 }
      );
    }

    // If the ingredient is used in meals, prevent deletion
    if (mealIngredient) {
      return NextResponse.json(
        {
          error: "Cannot delete ingredient that is used in meals",
          success: false,
        },
        { status: 400 }
      );
    }

    // Delete from fridge_item first (foreign key constraint)
    const { error: fridgeError } = await supabaseAdmin
      .from("fridge_item")
      .delete()
      .eq("ingredient_id", id);

    if (fridgeError) {
      console.error("Error deleting from fridge:", fridgeError);
      return NextResponse.json(
        { error: "Internal server error", success: false },
        { status: 500 }
      );
    }

    // Then delete the ingredient itself
    const { error: ingredientError } = await supabaseAdmin
      .from("ingredient")
      .delete()
      .eq("id", id);

    if (ingredientError) {
      console.error("Error deleting ingredient:", ingredientError);
      return NextResponse.json(
        { error: "Internal server error", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
