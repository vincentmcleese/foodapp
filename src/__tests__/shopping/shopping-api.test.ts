import { createMocks } from "node-mocks-http";
import { GET } from "@/app/api/shopping/route";
import { supabaseAdmin } from "@/lib/supabase";
import { ShoppingItem } from "@/lib/api-services";
import { NextResponse } from "next/server";

// Mock the Supabase client
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
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

describe("Shopping API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a shopping list with correct status indicators", async () => {
    // Mock plan entries response
    const mockPlanEntries = [
      {
        id: "1",
        meal_id: "meal1",
      },
    ];

    const mockMeals = [
      {
        id: "meal1",
        name: "Spaghetti Bolognese",
      },
    ];

    const mockMealIngredients = [
      {
        id: "meal-ing-1",
        meal_id: "meal1",
        ingredient_id: "ing1",
        quantity: 500,
        unit: "g",
      },
      {
        id: "meal-ing-2",
        meal_id: "meal1",
        ingredient_id: "ing2",
        quantity: 100,
        unit: "g",
      },
    ];

    const mockIngredients = [
      {
        id: "ing1",
        name: "Ground Beef",
      },
      {
        id: "ing2",
        name: "Spaghetti",
      },
    ];

    // Mock fridge items response
    const mockFridgeItems = [
      {
        id: "fridge1",
        ingredient_id: "ing1",
        quantity: 200,
        unit: "g",
      },
      {
        id: "fridge2",
        ingredient_id: "ing2",
        quantity: 200,
        unit: "g",
      },
    ];

    // Setup the individual Supabase query mocks
    const planEntriesQuery = jest.fn().mockResolvedValue({
      data: mockPlanEntries,
      error: null,
    });

    const mealsQuery = jest.fn().mockResolvedValue({
      data: mockMeals,
      error: null,
    });

    const mealIngredientsQuery = jest.fn().mockResolvedValue({
      data: mockMealIngredients,
      error: null,
    });

    const ingredientsQuery = jest.fn().mockResolvedValue({
      data: mockIngredients,
      error: null,
    });

    const fridgeItemsQuery = jest.fn().mockResolvedValue({
      data: mockFridgeItems,
      error: null,
    });

    // Mock the Supabase from method to return different selects based on table
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return { select: planEntriesQuery };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnValue({ select: mealsQuery }),
        };
      } else if (table === "meal_ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnValue({ select: mealIngredientsQuery }),
        };
      } else if (table === "ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnValue({ select: ingredientsQuery }),
        };
      } else if (table === "fridge_item") {
        return { select: fridgeItemsQuery };
      }
      return { select: jest.fn() };
    });

    // Call the API
    const response = await GET();
    const data = await response.json();

    // Assertions
    expect(supabaseAdmin.from).toHaveBeenCalledWith("plan_entry");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("fridge_item");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal_ingredient");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");

    // Check the response structure
    expect(data).toHaveProperty("shoppingList");
    expect(data).toHaveProperty("totalItems");
    expect(data).toHaveProperty("needToBuy");
    expect(data).toHaveProperty("partial");
    expect(data).toHaveProperty("inStock");

    // Check shopping list has items
    expect(Array.isArray(data.shoppingList)).toBe(true);
  });

  it("should handle API errors gracefully", async () => {
    // Setup the mocks to return an error
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
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
    const response = await GET();

    // Check response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to fetch plan entries");
  });
});
