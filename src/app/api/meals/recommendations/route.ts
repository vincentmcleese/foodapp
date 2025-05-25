import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateMealRecommendations } from "@/lib/ai-service";

export async function GET(request: Request) {
  console.log("API route /api/meals/recommendations called");

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "6", 10);
    const cuisine = url.searchParams.get("cuisine") || undefined;
    const maxPrepTime = url.searchParams.get("maxPrepTime")
      ? parseInt(url.searchParams.get("maxPrepTime") as string, 10)
      : undefined;

    console.log("Request params:", { page, pageSize, cuisine, maxPrepTime });

    // Get fridge items to generate recommendations from
    const { data: fridgeItems, error: fridgeError } = await supabaseAdmin.from(
      "fridge_item"
    ).select(`
        *,
        ingredient (
          id,
          name
        )
      `);

    if (fridgeError) {
      console.error("Error fetching fridge items:", fridgeError);
      return NextResponse.json(
        { error: "Failed to fetch fridge items" },
        { status: 500 }
      );
    }

    console.log("Fridge items fetched:", fridgeItems?.length || 0);

    // Get health principles
    const { data: healthPrinciples, error: healthError } = await supabaseAdmin
      .from("health_principle")
      .select("*");

    if (healthError) {
      console.error("Error fetching health principles:", healthError);
      return NextResponse.json(
        { error: "Failed to fetch health principles" },
        { status: 500 }
      );
    }

    console.log("Health principles fetched:", healthPrinciples?.length || 0);

    // Get meal ratings to inform the recommendations
    const { data: mealRatings, error: ratingsError } = await supabaseAdmin.from(
      "feedback"
    ).select(`
        *,
        meal (
          id,
          name
        )
      `);

    if (ratingsError) {
      console.error("Error fetching meal ratings:", ratingsError);
      return NextResponse.json(
        { error: "Failed to fetch meal ratings" },
        { status: 500 }
      );
    }

    console.log("Meal ratings fetched:", mealRatings?.length || 0);
    console.log("Calling generateMealRecommendations with pageSize:", pageSize);

    // Generate meal recommendations
    const recommendations = await generateMealRecommendations(
      fridgeItems || [],
      healthPrinciples || [],
      mealRatings || [],
      pageSize
    );

    console.log("Recommendations generated:", recommendations?.length || 0);

    // Apply filters if needed
    let filteredRecommendations = recommendations;

    if (cuisine) {
      filteredRecommendations = filteredRecommendations.filter(
        (meal) => meal.cuisine.toLowerCase() === cuisine.toLowerCase()
      );
    }

    if (maxPrepTime) {
      filteredRecommendations = filteredRecommendations.filter(
        (meal) => meal.prepTime <= maxPrepTime
      );
    }

    console.log("After filtering:", filteredRecommendations.length);

    // Apply pagination manually since we're working with in-memory data
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRecommendations = filteredRecommendations.slice(
      startIndex,
      endIndex
    );

    console.log("After pagination:", paginatedRecommendations.length);

    // Add unique IDs to each recommendation
    const recommendationsWithIds = paginatedRecommendations.map(
      (meal, index) => ({
        id: `rec-${Date.now()}-${index}`,
        ...meal,
      })
    );

    console.log("Final response with IDs:", recommendationsWithIds.length);

    return NextResponse.json({
      recommendations: recommendationsWithIds,
      total: filteredRecommendations.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error generating meal recommendations:", error);
    return NextResponse.json(
      {
        error: "Failed to generate meal recommendations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
