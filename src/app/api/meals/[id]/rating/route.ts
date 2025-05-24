import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

// Schema for rating validation
const ratingSchema = z.object({
  rating: z.boolean({
    required_error: "Rating is required",
    invalid_type_error: "Rating must be a boolean",
  }),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if meal exists
    const { data: meal, error: mealError } = await supabaseAdmin
      .from("meal")
      .select("id")
      .eq("id", id)
      .single();

    if (mealError) {
      console.error("Error fetching meal:", mealError);
      return NextResponse.json(
        { error: "Meal not found" },
        { status: mealError.code === "PGRST116" ? 404 : 500 }
      );
    }

    // Get ratings for this meal
    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from("meal_rating")
      .select("*")
      .eq("meal_id", id);

    if (ratingsError) {
      console.error("Error fetching meal ratings:", ratingsError);
      return NextResponse.json(
        { error: "Failed to fetch meal ratings" },
        { status: 500 }
      );
    }

    // Calculate rating summary
    const likes = ratings.filter((r) => r.rating === true).length;
    const dislikes = ratings.filter((r) => r.rating === false).length;

    return NextResponse.json({
      likes,
      dislikes,
      total: ratings.length,
      // We don't have user authentication, so userRating is omitted
    });
  } catch (error) {
    console.error("Error in meal ratings GET:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const result = ratingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid rating data" },
        { status: 400 }
      );
    }

    const { rating } = result.data;

    // Check if meal exists
    const { data: meal, error: mealError } = await supabaseAdmin
      .from("meal")
      .select("id")
      .eq("id", id)
      .single();

    if (mealError) {
      console.error("Error fetching meal:", mealError);
      return NextResponse.json(
        { error: "Meal not found" },
        { status: mealError.code === "PGRST116" ? 404 : 500 }
      );
    }

    // In a real app with authentication, we would check if the user has already rated this meal
    // and update their rating instead of creating a new one, but for simplicity, we'll just create a new rating

    // Create a new rating
    const { data, error } = await supabaseAdmin
      .from("meal_rating")
      .insert({ meal_id: id, rating })
      .select()
      .single();

    if (error) {
      console.error("Error creating meal rating:", error);
      return NextResponse.json(
        { error: "Failed to rate meal" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in meal ratings POST:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
