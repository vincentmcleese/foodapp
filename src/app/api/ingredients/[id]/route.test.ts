import { NextRequest, NextResponse } from "next/server";
import { GET, PUT, DELETE } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    limit: jest.fn().mockReturnThis(),
  },
}));

// Get reference to the mocked Supabase client
const mockSupabaseClient = supabaseAdmin as jest.Mocked<
  typeof supabaseAdmin
> & {
  select: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  limit: jest.Mock;
};

describe("Ingredient Item API", () => {
  const mockParams = { params: { id: "test-id" } };
  const mockRequest = new NextRequest(
    new URL("http://localhost/api/ingredients/test-id")
  );
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock for NextResponse.json
    jsonMock = jest.fn();
    NextResponse.json = jsonMock;

    // Set up default mocks for Supabase responses
    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.update.mockReturnThis();
    mockSupabaseClient.delete.mockReturnThis();
    mockSupabaseClient.eq.mockReturnThis();
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: "test-id", name: "Test Ingredient" },
      error: null,
    });
    mockSupabaseClient.limit.mockReturnThis();
  });

  describe("GET /api/ingredients/[id]", () => {
    it("returns ingredient details", async () => {
      // Call the handler
      await GET(mockRequest, mockParams);

      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("ingredient");
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { id: "test-id", name: "Test Ingredient" },
        { status: 200 }
      );
    });

    it("returns 404 when ingredient is not found", async () => {
      // Mock Supabase to return no data
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Call the handler
      await GET(mockRequest, mockParams);

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    });

    it("returns 500 when database error occurs", async () => {
      // Mock Supabase to return an error
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler
      await GET(mockRequest, mockParams);

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to fetch ingredient" },
        { status: 500 }
      );
    });
  });

  describe("PUT /api/ingredients/[id]", () => {
    // Create a function to generate a new request for each test
    const createPutRequest = () =>
      new NextRequest(new URL("http://localhost/api/ingredients/test-id"), {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Ingredient", quantity: 5 }),
      });

    it("updates ingredient and returns success", async () => {
      // Mock Supabase update to succeed
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: "test-id", name: "Updated Ingredient", quantity: 5 },
        error: null,
      });

      // Call the handler with a fresh request
      await PUT(createPutRequest(), mockParams);

      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("ingredient");
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        name: "Updated Ingredient",
        quantity: 5,
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { id: "test-id", name: "Updated Ingredient", quantity: 5 },
        { status: 200 }
      );
    });

    it("returns 404 when ingredient is not found", async () => {
      // Mock Supabase to return no data
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Call the handler with a fresh request
      await PUT(createPutRequest(), mockParams);

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    });

    it("returns 500 when database error occurs", async () => {
      // Mock Supabase to return an error
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler with a fresh request
      await PUT(createPutRequest(), mockParams);

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to update ingredient" },
        { status: 500 }
      );
    });
  });

  describe("DELETE /api/ingredients/[id]", () => {
    it("deletes ingredient and returns success when not used in meals", async () => {
      // Mock meal ingredient check (no ingredients found in meals)
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === "meal_ingredient") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { success: true },
            error: null,
          }),
        };
      });

      // Call the handler
      await DELETE(mockRequest, mockParams);

      // Verify meal_ingredient check
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("meal_ingredient");

      // Since we're using mockImplementation, we need to modify our expectations
      // The test is now verifying the behavior rather than the exact call sequence
      expect(jsonMock).toHaveBeenCalledWith({ success: true }, { status: 200 });
    });

    it("returns 400 when ingredient is used in meals", async () => {
      // Mock meal ingredient check (ingredient found in meals)
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === "meal_ingredient") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: "meal-ingredient-id" },
              error: null,
            }),
          };
        }
        return mockSupabaseClient;
      });

      // Call the handler
      await DELETE(mockRequest, mockParams);

      // Verify response indicates the ingredient is in use
      expect(jsonMock).toHaveBeenCalledWith(
        {
          error: "Cannot delete ingredient that is used in meals",
          success: false,
        },
        { status: 400 }
      );
    });

    it("returns 500 when database error occurs", async () => {
      // Mock Supabase to return an error on meal ingredient check
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === "meal_ingredient") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          };
        }
        return mockSupabaseClient;
      });

      // Call the handler
      await DELETE(mockRequest, mockParams);

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Internal server error", success: false },
        { status: 500 }
      );
    });
  });
});
