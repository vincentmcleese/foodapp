import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateIngredientImage } from "@/lib/dalle-service";
import { saveIngredientImage } from "@/lib/storage-service";

/**
 * Generate an image for an ingredient using DALL-E and save it to Supabase Storage
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const { ingredientId, name } = await request.json();

    // Validate ingredientId
    if (!ingredientId) {
      return NextResponse.json(
        { error: "Missing ingredientId" },
        { status: 400 }
      );
    }

    let ingredientName = name;

    // If name is not provided, fetch it from the database
    if (!ingredientName) {
      const { data: ingredient, error } = await supabaseAdmin
        .from("ingredient")
        .select("name")
        .eq("id", ingredientId)
        .single();

      if (error || !ingredient) {
        console.error("Error fetching ingredient:", error);
        return NextResponse.json(
          { error: "Failed to fetch ingredient" },
          { status: 500 }
        );
      }

      ingredientName = ingredient.name;
    }

    // Validate that we now have a name
    if (!ingredientName) {
      return NextResponse.json(
        { error: "Missing ingredient name" },
        { status: 400 }
      );
    }

    console.log(
      `Processing image generation request for ${ingredientName} (${ingredientId})`
    );

    // Update status to generating
    const { error: statusError } = await supabaseAdmin
      .from("ingredient")
      .update({ image_status: "generating" })
      .eq("id", ingredientId);

    if (statusError) {
      console.error("Error updating ingredient status:", statusError);
      return NextResponse.json(
        { error: "Failed to update ingredient status" },
        { status: 500 }
      );
    }

    // Generate image with DALL-E
    const imageUrl = await generateIngredientImage(ingredientName);

    if (!imageUrl) {
      await supabaseAdmin
        .from("ingredient")
        .update({ image_status: "failed" })
        .eq("id", ingredientId);

      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // Save image to Supabase Storage
    const storedImageUrl = await saveIngredientImage(ingredientId, imageUrl);

    if (!storedImageUrl) {
      await supabaseAdmin
        .from("ingredient")
        .update({ image_status: "failed" })
        .eq("id", ingredientId);

      return NextResponse.json(
        { error: "Failed to store image" },
        { status: 500 }
      );
    }

    // Update ingredient record with image URL and status
    const { error: updateError } = await supabaseAdmin
      .from("ingredient")
      .update({
        image_url: storedImageUrl,
        image_status: "completed",
      })
      .eq("id", ingredientId);

    if (updateError) {
      console.error("Error updating ingredient with image URL:", updateError);
      return NextResponse.json(
        { error: "Failed to update ingredient" },
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
