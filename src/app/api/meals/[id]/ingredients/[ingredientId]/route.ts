import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE a specific ingredient from a meal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const { id, ingredientId } = await params;

    const { error } = await supabaseAdmin
      .from("meal_ingredient")
      .delete()
      .eq("meal_id", id)
      .eq("ingredient_id", ingredientId);

    if (error) {
      console.error(
        `Error deleting ingredient ${ingredientId} from meal ${id}:`,
        error
      );
      return NextResponse.json(
        { error: "Failed to delete ingredient from meal" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Unexpected error deleting ingredient from meal:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
