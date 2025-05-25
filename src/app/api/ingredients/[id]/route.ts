import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/ingredients/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching ingredient ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch ingredient" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/ingredients/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/ingredients/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ingredient ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to update ingredient" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/ingredients/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/ingredients/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, check if this ingredient is used in any meals
    const { data: mealIngredients, error: checkError } = await supabaseAdmin
      .from("meal_ingredient")
      .select("id")
      .eq("ingredient_id", id)
      .limit(1);

    if (checkError) {
      console.error(`Error checking meal_ingredient for ${id}:`, checkError);
      return NextResponse.json(
        { error: "Failed to check if ingredient is in use" },
        { status: 500 }
      );
    }

    // If the ingredient is used in a meal, don't allow deletion
    if (mealIngredients && mealIngredients.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete ingredient that is used in meals",
          success: false,
        },
        { status: 400 }
      );
    }

    // Delete from fridge_item first (foreign key constraints)
    await supabaseAdmin.from("fridge_item").delete().eq("ingredient_id", id);

    // Then delete the ingredient
    const { error } = await supabaseAdmin
      .from("ingredient")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting ingredient ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to delete ingredient", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/ingredients/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
