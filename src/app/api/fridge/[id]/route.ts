import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET a single fridge item by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("fridge_item")
      .select(
        `
        *,
        ingredient(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching fridge item ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch fridge item" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Unexpected error fetching fridge item:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// UPDATE a fridge item by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ingredient_id, quantity, unit, status, expiry_date, expires_at } =
      body;

    // Get the current fridge item and its ingredient type
    const { data: fridgeItemData, error: fridgeItemError } = await supabaseAdmin
      .from("fridge_item")
      .select(
        `
        *,
        ingredient:ingredient_id (ingredient_type)
      `
      )
      .eq("id", id)
      .single();

    if (fridgeItemError) {
      console.error(`Error fetching fridge item ${id}:`, fridgeItemError);
      return NextResponse.json(
        { error: "Failed to fetch fridge item" },
        { status: fridgeItemError.code === "PGRST116" ? 404 : 500 }
      );
    }

    // If ingredient_id is changing, get the new ingredient type
    let ingredientType = fridgeItemData.ingredient.ingredient_type;
    if (ingredient_id && ingredient_id !== fridgeItemData.ingredient_id) {
      const { data: ingredientData, error: ingredientError } =
        await supabaseAdmin
          .from("ingredient")
          .select("ingredient_type")
          .eq("id", ingredient_id)
          .single();

      if (ingredientError) {
        console.error(
          `Error fetching ingredient ${ingredient_id}:`,
          ingredientError
        );
        return NextResponse.json(
          { error: "Failed to fetch ingredient data" },
          { status: 500 }
        );
      }

      ingredientType = ingredientData.ingredient_type;
    }

    // Validate that at least one field is being updated
    if (
      !ingredient_id &&
      quantity === undefined &&
      unit === undefined &&
      status === undefined &&
      !expiry_date &&
      !expires_at
    ) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    // Set fields based on ingredient type
    if (ingredientType === "pantry") {
      // For pantry items
      if (ingredient_id) updateData.ingredient_id = ingredient_id;
      if (status) {
        if (!["IN_STOCK", "NOT_IN_STOCK"].includes(status)) {
          return NextResponse.json(
            {
              error:
                "Status must be either IN_STOCK or NOT_IN_STOCK for pantry items",
            },
            { status: 400 }
          );
        }
        updateData.status = status;
      }

      // Always ensure quantity and unit are null for pantry items
      updateData.quantity = null;
      updateData.unit = null;
    } else {
      // For regular ingredients
      if (ingredient_id) updateData.ingredient_id = ingredient_id;
      if (quantity !== undefined) updateData.quantity = quantity;
      if (unit) updateData.unit = unit;

      // Always ensure status is null for regular ingredients
      updateData.status = null;
    }

    // Common fields for both types
    if (expiry_date) updateData.expires_at = expiry_date;
    if (expires_at) updateData.expires_at = expires_at;

    const { data, error } = await supabaseAdmin
      .from("fridge_item")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating fridge item ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to update fridge item" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Unexpected error updating fridge item:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE a fridge item by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("fridge_item")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting fridge item ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to delete fridge item" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Unexpected error deleting fridge item:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
