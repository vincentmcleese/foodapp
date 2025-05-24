import { createMocks } from "node-mocks-http";
import { GET } from "@/app/api/shopping/route";
import { supabaseAdmin } from "@/lib/supabase";
import { ShoppingItem } from "@/lib/api-services";

// Mock the Supabase client
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

describe("Shopping API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a shopping list with correct status indicators", async () => {
    // Mock plan entries response
    const mockPlanEntries = [
      {
        id: "1",
        meal: {
          id: "meal1",
          name: "Spaghetti Bolognese",
          ingredients: [
            {
              id: "meal-ing-1",
              quantity: 500,
              unit: "g",
              ingredient: {
                id: "ing1",
                name: "Ground Beef",
              },
            },
            {
              id: "meal-ing-2",
              quantity: 100,
              unit: "g",
              ingredient: {
                id: "ing2",
                name: "Spaghetti",
              },
            },
          ],
        },
      },
    ];

    // Mock fridge items response
    const mockFridgeItems = [
      {
        id: "fridge1",
        ingredient_id: "ing1",
        quantity: 200,
        unit: "g",
        ingredient: {
          id: "ing1",
          name: "Ground Beef",
        },
      },
      {
        id: "fridge2",
        ingredient_id: "ing2",
        quantity: 200,
        unit: "g",
        ingredient: {
          id: "ing2",
          name: "Spaghetti",
        },
      },
    ];

    // Setup the mocks
    const selectMock = jest.fn();
    const fromMock = jest.fn(() => ({ select: selectMock }));
    (supabaseAdmin.from as jest.Mock).mockImplementation(fromMock);

    // Mock the first query for plan entries
    selectMock.mockResolvedValueOnce({
      data: mockPlanEntries,
      error: null,
    });

    // Mock the second query for fridge items
    selectMock.mockResolvedValueOnce({
      data: mockFridgeItems,
      error: null,
    });

    // Call the API
    const { req, res } = createMocks({
      method: "GET",
    });

    const response = await GET();
    const data = await response.json();

    // Assertions
    expect(supabaseAdmin.from).toHaveBeenCalledWith("plan_entry");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("fridge_item");
    expect(selectMock).toHaveBeenCalledTimes(2);

    // Check the response structure
    expect(data).toHaveProperty("shoppingList");
    expect(data).toHaveProperty("totalItems");
    expect(data).toHaveProperty("needToBuy");
    expect(data).toHaveProperty("partial");
    expect(data).toHaveProperty("inStock");

    // Check individual items
    expect(data.shoppingList).toHaveLength(2);

    // Ground Beef should be 'partial' (200g in fridge, 500g needed)
    const groundBeef = data.shoppingList.find(
      (item: ShoppingItem) => item.name === "Ground Beef"
    );
    expect(groundBeef).toBeDefined();
    expect(groundBeef?.status).toBe("partial");
    expect(groundBeef?.inStock).toBe(200);
    expect(groundBeef?.required).toBe(500);

    // Spaghetti should be 'in-stock' (200g in fridge, 100g needed)
    const spaghetti = data.shoppingList.find(
      (item: ShoppingItem) => item.name === "Spaghetti"
    );
    expect(spaghetti).toBeDefined();
    expect(spaghetti?.status).toBe("in-stock");
    expect(spaghetti?.inStock).toBe(200);
    expect(spaghetti?.required).toBe(100);
  });

  it("should handle API errors gracefully", async () => {
    // Setup the mocks to return an error
    const selectMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: "Database error", code: "PGRST123" },
    });

    const fromMock = jest.fn(() => ({ select: selectMock }));
    (supabaseAdmin.from as jest.Mock).mockImplementation(fromMock);

    // Call the API
    const { req, res } = createMocks({
      method: "GET",
    });

    const response = await GET();

    // Check response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });
});
