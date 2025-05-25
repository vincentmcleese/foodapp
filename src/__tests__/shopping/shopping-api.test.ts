import { NextResponse } from "next/server";
import { GET } from "@/app/api/shopping/route";
import { supabaseAdmin } from "@/lib/supabase";

// Interface for ShoppingItem
interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: "need-to-buy" | "partial" | "in-stock";
}

// Mock the Supabase client
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  },
}));

// Mock NextResponse.json
const mockJson = jest.fn();
NextResponse.json = mockJson;

describe("Shopping API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty list when no plan entries exist", async () => {
    // Mock empty plan entries
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the response
    expect(mockJson).toHaveBeenCalledWith({
      shoppingList: [],
      totalItems: 0,
      needToBuy: 0,
      partial: 0,
      inStock: 0,
    });
  });

  it("should return empty list when no meal ingredients exist", async () => {
    // Mock plan entries with meals but no ingredients
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: "plan1", meal_id: "meal1" }],
            error: null,
          }),
        };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{ id: "meal1", name: "Test Meal" }],
            error: null,
          }),
        };
      } else if (table === "meal_ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the response
    expect(mockJson).toHaveBeenCalledWith({
      shoppingList: [],
      totalItems: 0,
      needToBuy: 0,
      partial: 0,
      inStock: 0,
    });
  });

  it("should return a shopping list with correct status indicators", async () => {
    // Mock data for a complete shopping list test
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              { id: "plan1", meal_id: "meal1" },
              { id: "plan2", meal_id: "meal2" },
            ],
            error: null,
          }),
        };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              { id: "meal1", name: "Pasta" },
              { id: "meal2", name: "Salad" },
            ],
            error: null,
          }),
        };
      } else if (table === "meal_ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              {
                id: "mi1",
                meal_id: "meal1",
                ingredient_id: "ing1",
                quantity: 2,
                unit: "cups",
              },
              {
                id: "mi2",
                meal_id: "meal1",
                ingredient_id: "ing2",
                quantity: 1,
                unit: "unit",
              },
              {
                id: "mi3",
                meal_id: "meal2",
                ingredient_id: "ing3",
                quantity: 3,
                unit: "units",
              },
            ],
            error: null,
          }),
        };
      } else if (table === "ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              { id: "ing1", name: "Flour" },
              { id: "ing2", name: "Egg" },
              { id: "ing3", name: "Tomato" },
            ],
            error: null,
          }),
        };
      } else if (table === "fridge_item") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              { id: "fi1", ingredient_id: "ing1", quantity: 3, unit: "cups" }, // more than needed
              { id: "fi2", ingredient_id: "ing2", quantity: 0.5, unit: "unit" }, // less than needed
              // ing3 not in fridge
            ],
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify API calls
    expect(supabaseAdmin.from).toHaveBeenCalledWith("plan_entry");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("meal_ingredient");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("fridge_item");

    // Extract the argument to the mock
    const response = mockJson.mock.calls[0][0];

    // Verify the response structure
    expect(response).toHaveProperty("shoppingList");
    expect(response).toHaveProperty("totalItems", 3);

    // Verify statuses
    const needToBuy = response.shoppingList.filter(
      (item: ShoppingItem) => item.status === "need-to-buy"
    ).length;
    const partial = response.shoppingList.filter(
      (item: ShoppingItem) => item.status === "partial"
    ).length;
    const inStock = response.shoppingList.filter(
      (item: ShoppingItem) => item.status === "in-stock"
    ).length;

    expect(needToBuy).toBe(1); // ing3 (Tomato)
    expect(partial).toBe(1); // ing2 (Egg)
    expect(inStock).toBe(1); // ing1 (Flour)

    // Verify totals match
    expect(response.needToBuy).toBe(needToBuy);
    expect(response.partial).toBe(partial);
    expect(response.inStock).toBe(inStock);
  });

  it("should handle errors when fetching plan entries", async () => {
    // Mock error for plan entries
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to fetch plan entries" },
      { status: 500 }
    );
  });

  it("should handle errors when fetching meals", async () => {
    // Mock successful plan entries but error for meals
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: "plan1", meal_id: "meal1" }],
            error: null,
          }),
        };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  });

  it("should handle errors when fetching meal ingredients", async () => {
    // Mock successful plan entries and meals but error for meal ingredients
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: "plan1", meal_id: "meal1" }],
            error: null,
          }),
        };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{ id: "meal1", name: "Test Meal" }],
            error: null,
          }),
        };
      } else if (table === "meal_ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to fetch meal ingredients" },
      { status: 500 }
    );
  });

  it("should handle errors when fetching ingredients", async () => {
    // Mock successful data but error for ingredients
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: "plan1", meal_id: "meal1" }],
            error: null,
          }),
        };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{ id: "meal1", name: "Test Meal" }],
            error: null,
          }),
        };
      } else if (table === "meal_ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              {
                id: "mi1",
                meal_id: "meal1",
                ingredient_id: "ing1",
                quantity: 2,
                unit: "cups",
              },
            ],
            error: null,
          }),
        };
      } else if (table === "ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  });

  it("should handle errors when fetching fridge items", async () => {
    // Mock successful data but error for fridge items
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === "plan_entry") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: "plan1", meal_id: "meal1" }],
            error: null,
          }),
        };
      } else if (table === "meal") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{ id: "meal1", name: "Test Meal" }],
            error: null,
          }),
        };
      } else if (table === "meal_ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              {
                id: "mi1",
                meal_id: "meal1",
                ingredient_id: "ing1",
                quantity: 2,
                unit: "cups",
              },
            ],
            error: null,
          }),
        };
      } else if (table === "ingredient") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{ id: "ing1", name: "Flour" }],
            error: null,
          }),
        };
      } else if (table === "fridge_item") {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      };
    });

    // Call the API
    await GET();

    // Verify the error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to fetch fridge items" },
      { status: 500 }
    );
  });

  it("should handle general exceptions", async () => {
    // Mock an exception during processing
    (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    // Call the API
    await GET();

    // Verify the error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    );
  });
});
