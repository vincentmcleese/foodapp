import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET all fridge items
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("fridge_item").select(`
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition, ingredient_type, image_url, image_status)
      `);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching fridge items:", error);
    return NextResponse.json(
      { error: "Failed to fetch fridge items" },
      { status: 500 }
    );
  }
}

// POST - Add a new fridge item
export async function POST(request: Request) {
  try {
    const fridgeItem = await request.json();

    // Get the ingredient to check its type
    const { data: ingredientData, error: ingredientError } = await supabaseAdmin
      .from("ingredient")
      .select("ingredient_type")
      .eq("id", fridgeItem.ingredient_id)
      .single();

    if (ingredientError) {
      console.error("Error fetching ingredient:", ingredientError);
      return NextResponse.json(
        { error: "Failed to fetch ingredient data" },
        { status: 500 }
      );
    }

    // Validate the input based on ingredient type
    if (ingredientData.ingredient_type === "pantry") {
      // For pantry items, status is required
      if (
        !fridgeItem.status ||
        !["IN_STOCK", "NOT_IN_STOCK"].includes(fridgeItem.status)
      ) {
        return NextResponse.json(
          {
            error:
              "Required field for pantry items: status (IN_STOCK or NOT_IN_STOCK)",
          },
          { status: 400 }
        );
      }

      // Ensure quantity and unit are null for pantry items
      fridgeItem.quantity = null;
      fridgeItem.unit = null;
    } else {
      // For regular ingredients, quantity and unit are required
      if (
        !fridgeItem.ingredient_id ||
        !fridgeItem.quantity ||
        !fridgeItem.unit
      ) {
        return NextResponse.json(
          {
            error:
              "Required fields for regular ingredients: ingredient_id, quantity, unit",
          },
          { status: 400 }
        );
      }

      // Ensure status is null for regular ingredients
      fridgeItem.status = null;
    }

    const { data, error } = await supabaseAdmin
      .from("fridge_item")
      .insert(fridgeItem)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding fridge item:", error);
    return NextResponse.json(
      { error: "Failed to add fridge item" },
      { status: 500 }
    );
  }
}
