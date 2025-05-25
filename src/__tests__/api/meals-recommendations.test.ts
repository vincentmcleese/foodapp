import { NextResponse } from "next/server";
import { GET } from "@/app/api/meals/recommendations/route";
import { POST } from "@/app/api/meals/save/route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock the Supabase client
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

// Mock OpenAI
jest.mock("@/lib/ai-service", () => ({
  generateMealRecommendations: jest.fn().mockResolvedValue([
    {
      name: "Grilled Chicken Salad",
      description: "A healthy grilled chicken salad with fresh vegetables",
      instructions: "1. Grill chicken\n2. Chop vegetables\n3. Mix and serve",
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      cuisine: "Mediterranean",
      ingredients: [
        { name: "Chicken Breast", quantity: 200, unit: "g" },
        { name: "Lettuce", quantity: 100, unit: "g" },
        { name: "Tomato", quantity: 1, unit: "whole" },
        { name: "Cucumber", quantity: 1, unit: "whole" },
        { name: "Olive Oil", quantity: 15, unit: "ml" },
      ],
      nutrition: {
        calories: 350,
        protein: 35,
        carbs: 10,
        fat: 20,
      },
    },
  ]),
}));

// Mock NextResponse
jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: jest.fn((data, options) => {
        return {
          status: options?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

describe("Meal Recommendations API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return meal recommendations based on fridge items", async () => {
    // Mock fridge items
    const mockFridgeItems = [
      {
        id: "1",
        ingredient_id: "ing1",
        ingredient: {
          id: "ing1",
          name: "Chicken Breast",
        },
        quantity: 300,
        unit: "g",
      },
      {
        id: "2",
        ingredient_id: "ing2",
        ingredient: {
          id: "ing2",
          name: "Lettuce",
        },
        quantity: 200,
        unit: "g",
      },
    ];

    // Mock health principles
    const mockHealthPrinciples = [
      {
        id: "1",
        name: "Low Carb",
        description: "Prefer low carb meals",
        enabled: true,
      },
    ];

    // Mock meal ratings
    const mockMealRatings = [
      {
        id: "1",
        meal_id: "meal1",
        meal: {
          id: "meal1",
          name: "Chicken Soup",
        },
        rating: 5,
      },
    ];

    // Setup Supabase mock responses
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "fridge_item") {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockFridgeItems,
            error: null,
          }),
        };
      } else if (table === "health_principle") {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockHealthPrinciples,
            error: null,
          }),
        };
      } else if (table === "feedback") {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockMealRatings,
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    // Call the API
    const request = new Request("http://localhost/api/meals/recommendations");
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(supabaseAdmin.from).toHaveBeenCalledWith("fridge_item");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("feedback");

    // Check the response structure
    expect(data).toHaveProperty("recommendations");
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data.recommendations.length).toBeGreaterThan(0);

    // Check the meal structure
    const meal = data.recommendations[0];
    expect(meal).toHaveProperty("name");
    expect(meal).toHaveProperty("description");
    expect(meal).toHaveProperty("instructions");
    expect(meal).toHaveProperty("prepTime");
    expect(meal).toHaveProperty("ingredients");
    expect(meal).toHaveProperty("nutrition");
  });

  it("should handle errors gracefully", async () => {
    // Mock Supabase error
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "fridge_item") {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error", code: "PGRST123" },
          }),
        };
      }
      return { select: jest.fn() };
    });

    // Call the API
    const request = new Request("http://localhost/api/meals/recommendations");
    const response = await GET(request);

    // Check error response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should save recommended meal to user meals", async () => {
    // Mock data for saving a meal
    const mockMealData = {
      name: "Grilled Chicken Salad",
      description: "A healthy grilled chicken salad with fresh vegetables",
      instructions: "1. Grill chicken\n2. Chop vegetables\n3. Mix and serve",
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      cuisine: "Mediterranean",
      ingredients: [
        { name: "Chicken Breast", quantity: 200, unit: "g" },
        { name: "Lettuce", quantity: 100, unit: "g" },
      ],
      nutrition: {
        calories: 350,
        protein: 35,
        carbs: 10,
        fat: 20,
      },
    };

    // Mock Supabase responses for saving a meal
    const mockMealId = "new-meal-id";
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "meal") {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ id: mockMealId, ...mockMealData, aiGenerated: true }],
              error: null,
            }),
          }),
        };
      } else if (table === "ingredient") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              { id: "ing1", name: "Chicken Breast" },
              { id: "ing2", name: "Lettuce" },
            ],
            error: null,
          }),
          upsert: jest.fn().mockResolvedValue({
            data: [
              { id: "ing1", name: "Chicken Breast" },
              { id: "ing2", name: "Lettuce" },
            ],
            error: null,
          }),
        };
      } else if (table === "meal_ingredient") {
        return {
          insert: jest.fn().mockResolvedValue({
            data: [
              { id: "mi1", meal_id: mockMealId, ingredient_id: "ing1" },
              { id: "mi2", meal_id: mockMealId, ingredient_id: "ing2" },
            ],
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    // Create request with meal data
    const request = new Request("http://localhost/api/meals/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockMealData),
    });

    // Call the API
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal_ingredient");

    // Check response
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("mealId", mockMealId);
  });
});
