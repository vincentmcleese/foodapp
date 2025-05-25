import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateMealImage } from "@/lib/dalle-service";
import { saveMealImage } from "@/lib/storage-service";

/**
 * Generate an image for a meal using DALL-E and save it to Supabase Storage
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const { mealId, name } = await request.json();

    // Validate mealId
    if (!mealId) {
      return NextResponse.json({ error: "Missing mealId" }, { status: 400 });
    }

    let mealName = name;

    // If name is not provided, fetch it from the database
    if (!mealName) {
      const { data: meal, error } = await supabaseAdmin
        .from("meal")
        .select("name")
        .eq("id", mealId)
        .single();

      if (error || !meal) {
        console.error("Error fetching meal:", error);
        return NextResponse.json(
          { error: "Failed to fetch meal" },
          { status: 500 }
        );
      }

      mealName = meal.name;
    }

    // Validate that we now have a name
    if (!mealName) {
      return NextResponse.json({ error: "Missing meal name" }, { status: 400 });
    }

    console.log(
      `Processing image generation request for meal: ${mealName} (${mealId})`
    );

    // Update status to generating
    const { error: statusError } = await supabaseAdmin
      .from("meal")
      .update({ image_status: "generating" })
      .eq("id", mealId);

    if (statusError) {
      console.error("Error updating meal status:", statusError);
      return NextResponse.json(
        { error: "Failed to update meal status" },
        { status: 500 }
      );
    }

    // Generate image with DALL-E
    const imageUrl = await generateMealImage(mealName);

    if (!imageUrl) {
      await supabaseAdmin
        .from("meal")
        .update({ image_status: "failed" })
        .eq("id", mealId);

      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // Save image to Supabase Storage
    const storedImageUrl = await saveMealImage(mealId, imageUrl);

    if (!storedImageUrl) {
      await supabaseAdmin
        .from("meal")
        .update({ image_status: "failed" })
        .eq("id", mealId);

      return NextResponse.json(
        { error: "Failed to store image" },
        { status: 500 }
      );
    }

    // Update meal record with image URL and status
    const { error: updateError } = await supabaseAdmin
      .from("meal")
      .update({
        image_url: storedImageUrl,
        image_status: "completed",
      })
      .eq("id", mealId);

    if (updateError) {
      console.error("Error updating meal with image URL:", updateError);
      return NextResponse.json(
        { error: "Failed to update meal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: storedImageUrl,
    });
  } catch (error) {
    console.error("Error in generate-image API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
