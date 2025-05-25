import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET a single plan entry by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("meal_plan")
      .select(
        `
        *,
        meal:meal_id (id, name, description, image_url, image_status, nutrition)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching plan entry ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch plan entry" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Unexpected error fetching plan entry:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// UPDATE a plan entry by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { meal_id, date, meal_type } = body;

    // Validate that at least one field is being updated
    if (!meal_id && !date && !meal_type) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    if (meal_id) updateData.meal_id = meal_id;
    if (date) updateData.date = date;
    if (meal_type) updateData.meal_type = meal_type;

    const { data, error } = await supabaseAdmin
      .from("meal_plan")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating plan entry ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to update plan entry" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Unexpected error updating plan entry:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE a plan entry by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("meal_plan")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting plan entry ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to delete plan entry" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Unexpected error deleting plan entry:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
