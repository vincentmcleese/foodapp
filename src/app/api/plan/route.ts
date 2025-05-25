import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Mock data for development when Supabase connection fails
const mockPlanEntries = [
  {
    id: "mock-1",
    meal_id: "mock-meal-1",
    date: new Date().toISOString().split("T")[0],
    meal_type: "breakfast",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meal: {
      id: "mock-meal-1",
      name: "Mock Breakfast",
      description: "A sample breakfast for development",
      image_url: null,
      nutrition: { calories: 400, protein: 20, carbs: 40, fat: 15 },
    },
  },
  {
    id: "mock-2",
    meal_id: "mock-meal-2",
    date: new Date().toISOString().split("T")[0],
    meal_type: "lunch",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meal: {
      id: "mock-meal-2",
      name: "Mock Lunch",
      description: "A sample lunch for development",
      image_url: null,
      nutrition: { calories: 600, protein: 30, carbs: 60, fat: 20 },
    },
  },
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("meal_plan")
      .select(
        `
        *,
        meal:meal_id (id, name, description, image_url, nutrition)
      `
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching plan entries:", error);

      // In development, return mock data if Supabase connection fails
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock plan entries for development");
        return NextResponse.json(mockPlanEntries);
      }

      return NextResponse.json(
        { error: "Failed to fetch plan entries" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error fetching plan entries:", error);

    // In development, return mock data if an exception occurs
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock plan entries for development after exception");
      return NextResponse.json(mockPlanEntries);
    }

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
      .from("meal_plan")
      .insert({
        meal_id,
        date,
        meal_type,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating plan entry:", error);

      // In development, return mock success if Supabase connection fails
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock plan entry creation for development");
        return NextResponse.json({
          id: `mock-${Date.now()}`,
          meal_id,
          date,
          meal_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        { error: "Failed to create plan entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error creating plan entry:", error);

    // In development, return mock success if an exception occurs
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using mock plan entry creation for development after exception"
      );
      const { meal_id, date, meal_type } = await request.json().catch(() => ({
        meal_id: "mock-meal-recovery",
        date: new Date().toISOString().split("T")[0],
        meal_type: "recovery",
      }));

      return NextResponse.json({
        id: `mock-${Date.now()}`,
        meal_id,
        date,
        meal_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
