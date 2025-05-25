import { NextResponse } from "next/server";
import { GET, POST } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Mock NextResponse.json
const mockJson = jest.fn();
NextResponse.json = mockJson;

// Mock console.error to prevent noise in test output
jest.spyOn(console, "error").mockImplementation(() => {});

describe("Health Principles API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    (supabaseAdmin.from as jest.Mock).mockReturnThis();
    (supabaseAdmin.select as jest.Mock).mockReturnThis();
    (supabaseAdmin.insert as jest.Mock).mockReturnThis();
    (supabaseAdmin.order as jest.Mock).mockReturnThis();
    (supabaseAdmin.single as jest.Mock).mockReturnThis();
  });

  describe("GET /api/health/principles", () => {
    it("returns health principles successfully", async () => {
      // Mock successful response
      const mockPrinciples = [
        {
          id: "1",
          name: "Avoid Ultra-Processed Foods",
          description: "Minimize consumption of foods with...",
          enabled: true,
        },
        {
          id: "2",
          name: "Eat More Plants",
          description: "Increase intake of fresh vegetables...",
          enabled: true,
        },
      ];

      (supabaseAdmin.from().select().order as jest.Mock).mockResolvedValue({
        data: mockPrinciples,
        error: null,
      });

      // Call the endpoint
      await GET();

      // Verify Supabase was called correctly
      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(supabaseAdmin.select).toHaveBeenCalledWith("*");
      expect(supabaseAdmin.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      // Verify response
      expect(mockJson).toHaveBeenCalledWith(mockPrinciples);
    });

    it("handles database errors", async () => {
      // Mock database error
      (supabaseAdmin.from().select().order as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the endpoint
      await GET();

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to fetch health principles" },
        { status: 500 }
      );
    });

    it("handles unexpected errors", async () => {
      // Mock unexpected error
      (supabaseAdmin.from as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      // Call the endpoint
      await GET();

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Internal server error" },
        { status: 500 }
      );
    });
  });

  describe("POST /api/health/principles", () => {
    // Helper function to create mock request
    const createMockRequest = (body: any) =>
      new Request("http://localhost/api/health/principles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

    it("creates a health principle successfully", async () => {
      // Mock successful response
      const mockPrinciple = {
        id: "new-id",
        name: "New Principle",
        description: "Description of the new principle",
        enabled: true,
      };

      // Set up the chain of mocks
      const singleMock = jest.fn().mockResolvedValue({
        data: mockPrinciple,
        error: null,
      });

      const selectMock = jest.fn().mockReturnValue({
        single: singleMock,
      });

      const insertMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: insertMock,
      });

      // Create request with valid data
      const request = createMockRequest({
        name: "New Principle",
        description: "Description of the new principle",
        enabled: true,
      });

      // Call the endpoint
      await POST(request);

      // Verify Supabase was called correctly
      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(insertMock).toHaveBeenCalledWith({
        name: "New Principle",
        description: "Description of the new principle",
        enabled: true,
      });

      // Verify response
      expect(mockJson).toHaveBeenCalledWith(mockPrinciple, { status: 201 });
    });

    it("rejects invalid input data", async () => {
      // Create request with invalid data (missing required name)
      const request = createMockRequest({
        description: "No name provided",
        enabled: true,
      });

      // Call the endpoint
      await POST(request);

      // Verify validation error response
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Invalid data",
          details: expect.objectContaining({
            name: expect.anything(),
          }),
        }),
        { status: 400 }
      );
    });

    it("handles database errors during insertion", async () => {
      // Set up the chain of mocks with an error
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const selectMock = jest.fn().mockReturnValue({
        single: singleMock,
      });

      const insertMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: insertMock,
      });

      // Create request with valid data
      const request = createMockRequest({
        name: "New Principle",
        description: "Description",
        enabled: true,
      });

      // Call the endpoint
      await POST(request);

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to create health principle" },
        { status: 500 }
      );
    });

    it("handles unexpected errors", async () => {
      // Mock unexpected error
      (supabaseAdmin.from as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      // Create request with valid data
      const request = createMockRequest({
        name: "New Principle",
        enabled: true,
      });

      // Call the endpoint
      await POST(request);

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Internal server error" },
        { status: 500 }
      );
    });
  });
});
