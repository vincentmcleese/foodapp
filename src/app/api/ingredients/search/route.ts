import { NextResponse } from "next/server";
import { fuzzySearchIngredients } from "@/lib/fuzzy-search";

/**
 * Search for ingredients using fuzzy matching
 */
export async function GET(request: Request) {
  try {
    // Parse query parameter
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    // Perform fuzzy search
    const results = await fuzzySearchIngredients(query);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Error in ingredients search API:", error);
    return NextResponse.json(
      { error: "Failed to search ingredients" },
      { status: 500 }
    );
  }
}
