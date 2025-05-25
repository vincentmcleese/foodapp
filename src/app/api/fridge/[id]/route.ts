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
    const { ingredient_id, quantity, unit, expiry_date } = body;

    // Validate that at least one field is being updated
    if (!ingredient_id && !quantity && !unit && !expiry_date) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    if (ingredient_id) updateData.ingredient_id = ingredient_id;
    if (quantity) updateData.quantity = quantity;
    if (unit) updateData.unit = unit;
    if (expiry_date) updateData.expires_at = expiry_date;

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
