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
  count: number = 6
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
    // Format fridge items for prompt
    const fridgeItemsPrompt = fridgeItems
      .map((item) => `${item.quantity} ${item.unit} of ${item.ingredient.name}`)
      .join(", ");

    // Format health principles for prompt
    const enabledPrinciples = healthPrinciples
      .filter((principle) => principle.enabled)
      .map((principle) =>
        principle.description
          ? `${principle.name}: ${principle.description}`
          : principle.name
      )
      .join("\n- ");

    const healthPrinciplesPrompt = enabledPrinciples
      ? `\n\nHealth Principles to follow:\n- ${enabledPrinciples}`
      : "";

    // Format meal ratings for prompt
    const ratingsPrompt =
      mealRatings.length > 0
        ? `\n\nPreviously rated meals:\n${mealRatings
            .map((rating) => `- ${rating.meal.name}: ${rating.rating}/5`)
            .join("\n")}`
        : "";

    // Create system prompt
    const systemPrompt = `You are a professional chef and nutritionist who creates personalized meal recommendations. 
Focus on healthy, balanced meals that are practical to prepare at home.
Always respond with a valid JSON object as specified in the user's request.`;

    // Create user prompt
    const userPrompt = `Please recommend ${count} meals based on the following information:

Available Ingredients:
${
  fridgeItemsPrompt || "No specific ingredients available"
}${healthPrinciplesPrompt}${ratingsPrompt}

For each meal, provide:
1. A descriptive name
2. A brief description
3. Step-by-step instructions
4. Preparation time (in minutes)
5. Cooking time (in minutes)
6. Number of servings
7. Cuisine type
8. List of ingredients with quantities and units
9. Nutrition information (calories, protein, carbs, fat)

Format your response as a valid JSON object EXACTLY as follows:
{
  "recommendations": [
    {
      "name": "Meal Name",
      "description": "Brief description",
      "instructions": "Step by step instructions",
      "prepTime": 15,
      "cookTime": 25,
      "servings": 4,
      "cuisine": "Cuisine type",
      "ingredients": [
        {"name": "Ingredient 1", "quantity": 200, "unit": "g"},
        {"name": "Ingredient 2", "quantity": 1, "unit": "cup"}
      ],
      "nutrition": {
        "calories": 350,
        "protein": 25,
        "carbs": 30,
        "fat": 12
      }
    }
    // Additional meals as needed
  ]
}`;

    console.log("Calling OpenAI API with prompts");

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
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
      console.log("Response structure:", Object.keys(parsedResponse));

      // Check if the response has recommendations field
      if (parsedResponse.recommendations) {
        return parsedResponse.recommendations;
      }

      // Check if the response is already an array of meal recommendations
      if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
        console.log("Found array directly in response");
        return parsedResponse;
      }

      // Check if response might be under a different key
      for (const key in parsedResponse) {
        if (
          Array.isArray(parsedResponse[key]) &&
          parsedResponse[key].length > 0
        ) {
          console.log(`Found array under key: ${key}`);
          return parsedResponse[key];
        }
      }

      // Check if the response is a single meal recommendation object
      if (
        typeof parsedResponse === "object" &&
        parsedResponse.name &&
        parsedResponse.ingredients
      ) {
        console.log("Found single meal recommendation object");
        return [parsedResponse];
      }

      // If we have a completely empty object, update the prompt and try again
      if (Object.keys(parsedResponse).length === 0) {
        console.error("Empty object received from OpenAI");
        return getMockRecommendations(count);
      }

      console.error(
        "No valid recommendations found in the response:",
        parsedResponse
      );
      return getMockRecommendations(count);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", responseContent);
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
