import { supabaseAdmin } from "@/lib/supabase";

/**
 * Save an image to Supabase Storage
 * @param id The ID of the item (ingredient or meal)
 * @param imageUrl The URL of the image to save (from DALL-E)
 * @param bucket The storage bucket name to use
 * @returns Public URL of the saved image or null if saving failed
 */
export async function saveImage(
  id: string,
  imageUrl: string,
  bucket: string
): Promise<string | null> {
  try {
    console.log(`Saving image for item ${id} to bucket ${bucket}`);

    // Fetch the image from OpenAI URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a unique filename with timestamp to avoid collisions
    const fileName = `${id}-${Date.now()}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: "image/png",
        cacheControl: "3600",
      });

    if (error) {
      console.error(
        `Error uploading image to Supabase bucket ${bucket}:`,
        error
      );
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log(`Image saved successfully at ${urlData.publicUrl}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error saving image to bucket ${bucket}:`, error);
    return null;
  }
}

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
  return saveImage(ingredientId, imageUrl, "ingredient-images");
}

/**
 * Save a meal image to Supabase Storage
 * @param mealId The ID of the meal
 * @param imageUrl The URL of the image to save (from DALL-E)
 * @returns Public URL of the saved image or null if saving failed
 */
export async function saveMealImage(
  mealId: string,
  imageUrl: string
): Promise<string | null> {
  return saveImage(mealId, imageUrl, "meal-images");
}
