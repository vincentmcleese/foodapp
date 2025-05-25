import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Updates the status of an ingredient
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const { id } = await params;

    // Parse the request body to get the status
    const { status } = await request.json();

    // Validate the status
    if (
      !status ||
      !["pending", "generating", "completed", "failed"].includes(status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the ingredient status
    const { error } = await supabaseAdmin
      .from("ingredient")
      .update({ image_status: status })
      .eq("id", id);

    if (error) {
      console.error("Error updating ingredient status:", error);
      return NextResponse.json(
        { error: "Failed to update ingredient status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      status,
    });
  } catch (error) {
    console.error("Error in ingredient status API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
