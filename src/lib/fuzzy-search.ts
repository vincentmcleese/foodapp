import Fuse from "fuse.js";
import { supabaseAdmin } from "@/lib/supabase";
import { Ingredient } from "@/lib/api-services";

/**
 * Search for ingredients using fuzzy matching
 * @param query The search query
 * @param threshold Matching threshold (0-1, lower is more strict)
 * @returns Array of matching ingredients
 */
export async function fuzzySearchIngredients(
  query: string,
  threshold = 0.4
): Promise<Ingredient[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Fetch all ingredients from database
    const { data: ingredients, error } = await supabaseAdmin
      .from("ingredient")
      .select("*");

    if (error || !ingredients) {
      console.error("Error fetching ingredients for fuzzy search:", error);
      return [];
    }

    // Configure Fuse for fuzzy matching
    const fuse = new Fuse(ingredients, {
      keys: ["name"],
      threshold,
      includeScore: true,
    });

    // Perform search
    const searchResults = fuse.search(query);

    // Return matches that meet threshold
    return searchResults.map((result) => result.item as Ingredient);
  } catch (error) {
    console.error("Error in fuzzy search:", error);
    return [];
  }
}
