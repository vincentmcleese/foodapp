import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE an ingredient from a meal
export async function DELETE(
  request: Request,
  context: { params: { id: string; ingredientId: string } }
) {
  try {
    const { id, ingredientId } = context.params;

    // Delete the ingredient from the meal
    const { error } = await supabaseAdmin
      .from("meal_ingredient")
      .delete()
      .eq("id", ingredientId)
      .eq("meal_id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      `Error removing ingredient ${context.params.ingredientId} from meal ${context.params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to remove ingredient from meal" },
      { status: 500 }
    );
  }
}
