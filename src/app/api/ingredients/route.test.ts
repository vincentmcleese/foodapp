import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Get reference to the mocked Supabase client
const mockSupabaseClient = supabaseAdmin as jest.Mocked<
  typeof supabaseAdmin
> & {
  select: jest.Mock;
  insert: jest.Mock;
  single: jest.Mock;
};

describe("Ingredients Collection API", () => {
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock for NextResponse.json
    jsonMock = jest.fn();
    NextResponse.json = jsonMock;

    // Set up default mocks for Supabase responses
    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis();
    mockSupabaseClient.insert.mockReturnThis();
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: "test-id", name: "Test Ingredient" },
      error: null,
    });
  });

  describe("GET /api/ingredients", () => {
    it("returns all ingredients", async () => {
      // Mock Supabase to return ingredients
      mockSupabaseClient.select.mockResolvedValue({
        data: [
          { id: "1", name: "Tomatoes" },
          { id: "2", name: "Onions" },
        ],
        error: null,
      });

      // Call the handler
      await GET();

      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("ingredient");
      expect(mockSupabaseClient.select).toHaveBeenCalled();

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith([
        { id: "1", name: "Tomatoes" },
        { id: "2", name: "Onions" },
      ]);
    });

    it("returns 500 when database error occurs", async () => {
      // Mock Supabase to return an error
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler
      await GET();

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to fetch ingredients" },
        { status: 500 }
      );
    });
  });

  describe("POST /api/ingredients", () => {
    const createPostRequest = (body: any) =>
      new NextRequest(new URL("http://localhost/api/ingredients"), {
        method: "POST",
        body: JSON.stringify(body),
      });

    it("creates a new ingredient successfully", async () => {
      // Mock Supabase to return the created ingredient
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: "new-id",
          name: "New Ingredient",
          image_status: "pending",
        },
        error: null,
      });

      // Call the handler with a valid request
      await POST(
        createPostRequest({
          name: "New Ingredient",
        })
      );

      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("ingredient");
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        name: "New Ingredient",
        image_status: "pending",
      });

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith({
        id: "new-id",
        name: "New Ingredient",
        image_status: "pending",
      });
    });

    it("returns 400 when name is missing", async () => {
      // Call the handler with an invalid request (missing name)
      await POST(createPostRequest({}));

      // Verify Supabase was not called
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled();

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Name is required" },
        { status: 400 }
      );
    });

    it("returns 500 when database error occurs", async () => {
      // Mock Supabase to return an error
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler with a valid request
      await POST(
        createPostRequest({
          name: "New Ingredient",
        })
      );

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to create ingredient" },
        { status: 500 }
      );
    });
  });
});
