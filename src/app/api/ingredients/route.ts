import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET: Fetch all ingredients
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("ingredient").select("*");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new ingredient
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Set default values
    const ingredient = {
      name: body.name,
      image_status: body.image_status || "pending",
      ingredient_type: body.ingredient_type || "regular",
    };

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .insert(ingredient)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}
