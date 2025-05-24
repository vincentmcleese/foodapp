import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET all ingredients
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

// POST - Add a new ingredient
export async function POST(request: Request) {
  try {
    const ingredient = await request.json();

    // Validate the input
    if (!ingredient.name) {
      return NextResponse.json(
        { error: "Required field: name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .insert(ingredient)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  }
}
