import { NextResponse } from "next/server";
import { POST } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Mock NextResponse.json
const mockJson = jest.fn();
NextResponse.json = mockJson;

describe("Meals Save API", () => {
  const createMockRequest = (body: any) =>
    new Request("http://localhost/api/meals/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 with invalid meal data", async () => {
    // Test with missing name
    const request = createMockRequest({
      description: "Test meal without name",
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalledWith(
      { error: "Invalid meal data" },
      { status: 400 }
    );
  });

  it("should save a meal without ingredients successfully", async () => {
    // Mock a successful meal insertion
    const mockMeal = {
      id: "meal-123",
      name: "Test Meal",
    };

    // We need to mock the chain of function calls
    const mockInsert = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockMeal,
        error: null,
      }),
    };

    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue(mockInsert),
    });

    // Create request with valid meal data but no ingredients
    const request = createMockRequest({
      name: "Test Meal",
      description: "A test meal",
      prepTime: 10,
      cookTime: 20,
      servings: 2,
    });

    await POST(request);

    // Verify Supabase calls
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal");

    // Verify response
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      mealId: "meal-123",
      message: "Meal saved successfully",
    });
  });

  it("should save a meal with existing ingredients successfully", async () => {
    // Mock successful meal insertion
    const mockMeal = {
      id: "meal-123",
      name: "Test Meal",
    };

    // Mock existing ingredients
    const mockExistingIngredients = [
      { id: "ing-1", name: "Tomato" },
      { id: "ing-2", name: "Onion" },
    ];

    // Create a counter to track which call to from() we're on
    let fromCallCount = 0;

    // Set up mock implementation for different tables and call sequences
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      fromCallCount++;

      if (table === "meal") {
        // First call - meal insertion
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockMeal,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === "ingredient" && fromCallCount === 2) {
        // Second call - ingredient lookup
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockExistingIngredients,
              error: null,
            }),
          }),
        };
      } else if (table === "meal_ingredient") {
        // Third call - meal_ingredient insertion
        return {
          insert: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Create request with valid meal data and ingredients
    const request = createMockRequest({
      name: "Test Meal",
      description: "A test meal",
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      ingredients: [
        { name: "Tomato", quantity: 2, unit: "pcs" },
        { name: "Onion", quantity: 1, unit: "pcs" },
      ],
    });

    await POST(request);

    // Verify response
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      mealId: "meal-123",
      message: "Meal saved successfully",
    });
  });

  it("should handle meal insertion error", async () => {
    // Mock meal insertion error
    const mockInsertError = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      }),
    };

    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue(mockInsertError),
    });

    // Create request
    const request = createMockRequest({
      name: "Test Meal",
      description: "A test meal",
    });

    await POST(request);

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to save meal" },
      { status: 500 }
    );
  });

  it("should handle error when fetching ingredients", async () => {
    // Mock successful meal insertion
    const mockMeal = {
      id: "meal-123",
      name: "Test Meal",
    };

    // Set up mock implementation for meal success but ingredient fetch error
    let fromCallCount = 0;
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      fromCallCount++;

      if (table === "meal") {
        // First call - meal insertion success
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockMeal,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === "ingredient") {
        // Second call - ingredient lookup failure
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Create request with ingredients
    const request = createMockRequest({
      name: "Test Meal",
      description: "A test meal",
      ingredients: [{ name: "Tomato", quantity: 2, unit: "pcs" }],
    });

    await POST(request);

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to process ingredients" },
      { status: 500 }
    );
  });

  it("should handle error when inserting new ingredients", async () => {
    // Mock successful meal insertion
    const mockMeal = {
      id: "meal-123",
      name: "Test Meal",
    };

    // Set up complex mock implementation for different stages
    let fromCallCount = 0;
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      fromCallCount++;

      if (table === "meal") {
        // First call - meal insertion success
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockMeal,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === "ingredient" && fromCallCount === 2) {
        // Second call - ingredient lookup - return empty list
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [], // No existing ingredients
              error: null,
            }),
          }),
        };
      } else if (table === "ingredient" && fromCallCount === 3) {
        // Third call - ingredient insert - return error
        return {
          upsert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Create request with ingredients that need to be created
    const request = createMockRequest({
      name: "Test Meal",
      description: "A test meal",
      ingredients: [{ name: "New Ingredient", quantity: 2, unit: "pcs" }],
    });

    await POST(request);

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to create new ingredients" },
      { status: 500 }
    );
  });

  it("should handle error when inserting meal ingredients", async () => {
    // Mock successful meal insertion
    const mockMeal = {
      id: "meal-123",
      name: "Test Meal",
    };

    // Mock existing ingredients
    const mockExistingIngredients = [{ id: "ing-1", name: "Tomato" }];

    // Set up complex mock implementation
    let fromCallCount = 0;
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      fromCallCount++;

      if (table === "meal") {
        // First call - meal insertion success
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockMeal,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === "ingredient") {
        // Second call - ingredient lookup success
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockExistingIngredients,
              error: null,
            }),
          }),
        };
      } else if (table === "meal_ingredient") {
        // Third call - meal_ingredient insertion failure
        return {
          insert: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Create request with ingredients
    const request = createMockRequest({
      name: "Test Meal",
      description: "A test meal",
      ingredients: [{ name: "Tomato", quantity: 2, unit: "pcs" }],
    });

    await POST(request);

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to save meal ingredients" },
      { status: 500 }
    );
  });

  it("should handle unexpected errors", async () => {
    // Mock a global exception
    (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    // Create request
    const request = createMockRequest({
      name: "Test Meal",
    });

    await POST(request);

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to save meal" },
      { status: 500 }
    );
  });
});
