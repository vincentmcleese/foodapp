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
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Fridge item not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching fridge item:`, error);
    return NextResponse.json(
      { error: "Failed to fetch fridge item" },
      { status: 500 }
    );
  }
}

// PUT - Update a fridge item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fridgeItem = await request.json();

    const { data, error } = await supabaseAdmin
      .from("fridge_item")
      .update(fridgeItem)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Fridge item not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating fridge item:`, error);
    return NextResponse.json(
      { error: "Failed to update fridge item" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a fridge item
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

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting fridge item:`, error);
    return NextResponse.json(
      { error: "Failed to delete fridge item" },
      { status: 500 }
    );
  }
}
