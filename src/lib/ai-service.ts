import OpenAI from "openai";

// Interfaces
interface FridgeItem {
  id: string;
  ingredient_id: string;
  ingredient: {
    id: string;
    name: string;
  };
  quantity: number;
  unit: string;
}

interface HealthPrinciple {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

interface MealRating {
  id: string;
  meal_id: string;
  meal: {
    id: string;
    name: string;
  };
  rating: number;
}

export interface RecommendedMeal {
  name: string;
  description: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Create an OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates meal recommendations based on user data
 */
export async function generateMealRecommendations(
  fridgeItems: FridgeItem[],
  healthPrinciples: HealthPrinciple[],
  mealRatings: MealRating[],
  count: number = 3
): Promise<RecommendedMeal[]> {
  console.log("generateMealRecommendations called with:", {
    fridgeItemsCount: fridgeItems.length,
    healthPrinciplesCount: healthPrinciples.length,
    mealRatingsCount: mealRatings.length,
    count,
  });

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not configured!");
    return getMockRecommendations(count);
  }

  try {
    // Format fridge items for prompt - only include top 15 items to reduce token count
    const limitedFridgeItems = fridgeItems.slice(0, 15);
    const fridgeItemsPrompt = limitedFridgeItems
      .map((item) => `${item.quantity} ${item.unit} of ${item.ingredient.name}`)
      .join(", ");

    // Format health principles for prompt - only include enabled principles
    const enabledPrinciples = healthPrinciples
      .filter((principle) => principle.enabled)
      .map((principle) => principle.name)
      .join(", ");

    const healthPrinciplesPrompt = enabledPrinciples
      ? `Health Principles: ${enabledPrinciples}`
      : "";

    // Format meal ratings for prompt - only include top 5 ratings
    const topRatings = mealRatings
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    const ratingsPrompt =
      topRatings.length > 0
        ? `Highly rated meals: ${topRatings
            .map((rating) => rating.meal.name)
            .join(", ")}`
        : "";

    // Create system prompt - simplified to reduce token count
    const systemPrompt = `You are a chef who creates meal recommendations. Respond with valid JSON.`;

    // Create user prompt - simplified with less detail to reduce token count and processing time
    const userPrompt = `Create ${count} meal recommendations using these ingredients: ${
      fridgeItemsPrompt || "any ingredients"
    }.
${healthPrinciplesPrompt}
${ratingsPrompt}

Format your response as this JSON:
{
  "recommendations": [
    {
      "name": "Meal Name",
      "description": "Brief description",
      "instructions": "Steps",
      "prepTime": 15,
      "cookTime": 25,
      "servings": 4,
      "cuisine": "Type",
      "ingredients": [
        {"name": "Ingredient", "quantity": 200, "unit": "g"}
      ],
      "nutrition": {
        "calories": 350,
        "protein": 25,
        "carbs": 30,
        "fat": 12
      }
    }
  ]
}`;

    console.log("Calling OpenAI API with optimized prompts");

    // Call OpenAI API - using a faster model for initial recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Using the 3.5 model for speed
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2500, // Limiting token output for faster response
    });

    // Parse and return the recommendations
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      console.error("No content in the OpenAI response");
      return getMockRecommendations(count);
    }

    console.log("OpenAI response received, parsing JSON");

    try {
      const parsedResponse = JSON.parse(responseContent);

      // Check if the response has recommendations field
      if (
        parsedResponse.recommendations &&
        Array.isArray(parsedResponse.recommendations)
      ) {
        return parsedResponse.recommendations;
      }

      console.error("No valid recommendations found in the response");
      return getMockRecommendations(count);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return getMockRecommendations(count);
    }
  } catch (error) {
    console.error("Error generating meal recommendations:", error);
    return getMockRecommendations(count);
  }
}

// Fallback function to return mock recommendations when OpenAI API fails
function getMockRecommendations(count: number): RecommendedMeal[] {
  console.log("Generating mock recommendations");

  const mockMeals: RecommendedMeal[] = [
    {
      name: "Mediterranean Grilled Chicken Salad",
      description:
        "A healthy and refreshing salad with grilled chicken and Mediterranean flavors",
      instructions:
        "1. Grill the chicken breasts\n2. Chop the vegetables\n3. Mix with olive oil and lemon dressing\n4. Top with feta cheese",
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      cuisine: "Mediterranean",
      ingredients: [
        { name: "Chicken Breast", quantity: 200, unit: "g" },
        { name: "Mixed Greens", quantity: 150, unit: "g" },
        { name: "Cherry Tomatoes", quantity: 100, unit: "g" },
        { name: "Cucumber", quantity: 1, unit: "medium" },
        { name: "Feta Cheese", quantity: 50, unit: "g" },
        { name: "Olive Oil", quantity: 2, unit: "tbsp" },
      ],
      nutrition: {
        calories: 350,
        protein: 30,
        carbs: 10,
        fat: 20,
      },
    },
    {
      name: "Asian Vegetable Stir Fry",
      description:
        "Quick and flavorful vegetable stir fry with Asian-inspired sauce",
      instructions:
        "1. Chop all vegetables\n2. Heat oil in a wok\n3. Stir fry vegetables\n4. Add sauce and serve over rice",
      prepTime: 10,
      cookTime: 10,
      servings: 2,
      cuisine: "Asian",
      ingredients: [
        { name: "Bell Pepper", quantity: 1, unit: "medium" },
        { name: "Broccoli", quantity: 150, unit: "g" },
        { name: "Carrots", quantity: 2, unit: "medium" },
        { name: "Snap Peas", quantity: 100, unit: "g" },
        { name: "Soy Sauce", quantity: 2, unit: "tbsp" },
        { name: "Sesame Oil", quantity: 1, unit: "tbsp" },
      ],
      nutrition: {
        calories: 250,
        protein: 8,
        carbs: 30,
        fat: 12,
      },
    },
    {
      name: "Italian Pasta Primavera",
      description: "Colorful pasta dish loaded with fresh seasonal vegetables",
      instructions:
        "1. Cook pasta al dente\n2. Sauté vegetables\n3. Combine with pasta\n4. Top with parmesan cheese",
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      cuisine: "Italian",
      ingredients: [
        { name: "Pasta", quantity: 300, unit: "g" },
        { name: "Zucchini", quantity: 1, unit: "medium" },
        { name: "Cherry Tomatoes", quantity: 200, unit: "g" },
        { name: "Bell Pepper", quantity: 1, unit: "medium" },
        { name: "Parmesan Cheese", quantity: 50, unit: "g" },
        { name: "Olive Oil", quantity: 3, unit: "tbsp" },
      ],
      nutrition: {
        calories: 400,
        protein: 12,
        carbs: 60,
        fat: 15,
      },
    },
    {
      name: "Mexican Quinoa Bowl",
      description:
        "Protein-packed bowl with Mexican flavors and fresh vegetables",
      instructions:
        "1. Cook quinoa according to package\n2. Prepare beans and corn\n3. Chop fresh vegetables\n4. Assemble bowl with all ingredients\n5. Top with avocado and lime",
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      cuisine: "Mexican",
      ingredients: [
        { name: "Quinoa", quantity: 150, unit: "g" },
        { name: "Black Beans", quantity: 200, unit: "g" },
        { name: "Corn", quantity: 100, unit: "g" },
        { name: "Cherry Tomatoes", quantity: 100, unit: "g" },
        { name: "Avocado", quantity: 1, unit: "medium" },
        { name: "Lime", quantity: 1, unit: "medium" },
        { name: "Cilantro", quantity: 10, unit: "g" },
      ],
      nutrition: {
        calories: 450,
        protein: 15,
        carbs: 65,
        fat: 18,
      },
    },
    {
      name: "Teriyaki Salmon with Vegetables",
      description:
        "Flavorful salmon glazed with homemade teriyaki sauce served with steamed vegetables",
      instructions:
        "1. Prepare the teriyaki sauce\n2. Marinate salmon fillets\n3. Steam vegetables\n4. Bake or pan-sear salmon\n5. Drizzle with extra sauce before serving",
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      cuisine: "Japanese",
      ingredients: [
        { name: "Salmon Fillets", quantity: 300, unit: "g" },
        { name: "Soy Sauce", quantity: 3, unit: "tbsp" },
        { name: "Honey", quantity: 2, unit: "tbsp" },
        { name: "Garlic", quantity: 2, unit: "cloves" },
        { name: "Broccoli", quantity: 150, unit: "g" },
        { name: "Carrots", quantity: 2, unit: "medium" },
        { name: "Sesame Seeds", quantity: 1, unit: "tbsp" },
      ],
      nutrition: {
        calories: 420,
        protein: 35,
        carbs: 25,
        fat: 22,
      },
    },
    {
      name: "Vegetarian Chickpea Curry",
      description:
        "Hearty and warming curry with protein-rich chickpeas and aromatic spices",
      instructions:
        "1. Sauté onions and garlic\n2. Add spices and toast briefly\n3. Add chickpeas and tomatoes\n4. Simmer until flavors meld\n5. Serve with rice or naan bread",
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      cuisine: "Indian",
      ingredients: [
        { name: "Chickpeas", quantity: 400, unit: "g" },
        { name: "Diced Tomatoes", quantity: 400, unit: "g" },
        { name: "Onion", quantity: 1, unit: "medium" },
        { name: "Garlic", quantity: 3, unit: "cloves" },
        { name: "Curry Powder", quantity: 2, unit: "tbsp" },
        { name: "Coconut Milk", quantity: 200, unit: "ml" },
        { name: "Spinach", quantity: 100, unit: "g" },
      ],
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 14,
      },
    },
  ];

  // Return the requested number of mock meals
  return mockMeals.slice(0, count);
}
