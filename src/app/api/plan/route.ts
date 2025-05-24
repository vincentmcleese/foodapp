import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("plan_entry")
      .select(
        `
        *,
        meal:meal_id (id, name, description, image_url, nutrition)
      `
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching plan entries:", error);
      return NextResponse.json(
        { error: "Failed to fetch plan entries" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error fetching plan entries:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meal_id, date, meal_type } = body;

    // Validate required fields
    if (!meal_id || !date || !meal_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the new plan entry
    const { data, error } = await supabaseAdmin
      .from("plan_entry")
      .insert({
        meal_id,
        date,
        meal_type,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating plan entry:", error);
      return NextResponse.json(
        { error: "Failed to create plan entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error creating plan entry:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
