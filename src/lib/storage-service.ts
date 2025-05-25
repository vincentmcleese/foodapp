import { supabaseAdmin } from "@/lib/supabase";

/**
 * Save an ingredient image to Supabase Storage
 * @param ingredientId The ID of the ingredient
 * @param imageUrl The URL of the image to save (from DALL-E)
 * @returns Public URL of the saved image or null if saving failed
 */
export async function saveIngredientImage(
  ingredientId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    console.log(`Saving image for ingredient ${ingredientId}`);

    // Fetch the image from OpenAI URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a unique filename with timestamp to avoid collisions
    const fileName = `${ingredientId}-${Date.now()}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("ingredient-images")
      .upload(fileName, blob, {
        contentType: "image/png",
        cacheControl: "3600",
      });

    if (error) {
      console.error("Error uploading image to Supabase:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("ingredient-images")
      .getPublicUrl(fileName);

    console.log(`Image saved successfully at ${urlData.publicUrl}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error saving ingredient image:", error);
    return null;
  }
}
