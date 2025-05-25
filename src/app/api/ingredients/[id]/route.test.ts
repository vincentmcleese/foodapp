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

describe("Ingredient Item API", () => {
  const mockParams = Promise.resolve({ id: "test-id" });
  const mockRequest = new NextRequest(
    new URL("http://localhost/api/ingredients/test-id")
  );
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock for NextResponse.json
    jsonMock = jest.fn().mockImplementation((data) => ({ ...data }));
    (NextResponse.json as jest.Mock) = jsonMock;
  });

  describe("GET /api/ingredients/[id]", () => {
    it("returns 200 with ingredient data when found", async () => {
      // Setup mock data
      const mockIngredient = {
        id: "test-id",
        name: "Test Ingredient",
        image_url: "https://example.com/image.jpg",
      };

      // Mock Supabase response
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: mockIngredient,
        error: null,
      });

      // Call the handler
      await GET(mockRequest, { params: mockParams });

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");
      expect(supabaseAdmin.select).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(mockIngredient);
    });

    it("returns 404 when ingredient not found", async () => {
      // Mock not found response
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      // Call the handler
      await GET(mockRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to fetch ingredient" },
        { status: 404 }
      );
    });
  });

  describe("PUT /api/ingredients/[id]", () => {
    it("updates ingredient and returns 200 when successful", async () => {
      // Setup request body
      const requestBody = { name: "Updated Ingredient" };
      const mockPutRequest = new NextRequest(
        new URL("http://localhost/api/ingredients/test-id"),
        { method: "PUT", body: JSON.stringify(requestBody) }
      );

      // Mock Supabase response
      const updatedIngredient = {
        id: "test-id",
        ...requestBody,
        updated_at: new Date().toISOString(),
      };
      (
        supabaseAdmin.from().update().eq().select().single as jest.Mock
      ).mockResolvedValue({
        data: updatedIngredient,
        error: null,
      });

      // Call the handler
      await PUT(mockPutRequest, { params: mockParams });

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");
      expect(supabaseAdmin.update).toHaveBeenCalledWith(requestBody);
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(updatedIngredient);
    });

    it("returns 500 when database error occurs", async () => {
      // Setup request
      const requestBody = { name: "Updated Ingredient" };
      const mockPutRequest = new NextRequest(
        new URL("http://localhost/api/ingredients/test-id"),
        { method: "PUT", body: JSON.stringify(requestBody) }
      );

      // Mock database error
      (
        supabaseAdmin.from().update().eq().select().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler
      await PUT(mockPutRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to update ingredient" },
        { status: 500 }
      );
    });
  });

  describe("DELETE /api/ingredients/[id]", () => {
    it("deletes ingredient and returns success when not used in meals", async () => {
      // Mock meal ingredient check (no ingredients found)
      (supabaseAdmin.from().select().eq().limit as jest.Mock).mockResolvedValue(
        {
          data: [],
          error: null,
        }
      );

      // Mock fridge_item delete
      (supabaseAdmin.from().delete().eq as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      // Mock ingredient delete
      (supabaseAdmin.from().delete().eq as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Verify meal_ingredient check
      expect(supabaseAdmin.from).toHaveBeenCalledWith("meal_ingredient");
      expect(supabaseAdmin.select).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("ingredient_id", "test-id");

      // Verify fridge_item delete
      expect(supabaseAdmin.from).toHaveBeenCalledWith("fridge_item");
      expect(supabaseAdmin.delete).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("ingredient_id", "test-id");

      // Verify ingredient delete
      expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");
      expect(supabaseAdmin.delete).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith({ success: true });
    });

    it("returns 400 when ingredient is used in meals", async () => {
      // Mock meal ingredient check (ingredient found in meals)
      (supabaseAdmin.from().select().eq().limit as jest.Mock).mockResolvedValue(
        {
          data: [{ id: "meal-ingredient-id" }],
          error: null,
        }
      );

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        {
          error: "Cannot delete ingredient that is used in meals",
          success: false,
        },
        { status: 400 }
      );

      // Verify no delete calls were made
      expect(supabaseAdmin.delete).not.toHaveBeenCalled();
    });

    it("returns 500 when database error occurs", async () => {
      // Mock meal ingredient check success
      (supabaseAdmin.from().select().eq().limit as jest.Mock).mockResolvedValue(
        {
          data: [],
          error: null,
        }
      );

      // Mock delete error
      (supabaseAdmin.from().delete().eq as jest.Mock).mockResolvedValue({
        error: { message: "Database error" },
      });

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to delete ingredient", success: false },
        { status: 500 }
      );
    });
  });
});
