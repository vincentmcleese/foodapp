import { NextResponse } from "next/server";
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
  },
}));

// Mock NextResponse.json
const mockJson = jest.fn();
NextResponse.json = mockJson;

// Mock console.error to prevent noise in test output
jest.spyOn(console, "error").mockImplementation(() => {});

describe("Health Principle [id] API Routes", () => {
  const mockParams = Promise.resolve({ id: "test-id" });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    (supabaseAdmin.from as jest.Mock).mockReturnThis();
    (supabaseAdmin.select as jest.Mock).mockReturnThis();
    (supabaseAdmin.update as jest.Mock).mockReturnThis();
    (supabaseAdmin.delete as jest.Mock).mockReturnThis();
    (supabaseAdmin.eq as jest.Mock).mockReturnThis();
    (supabaseAdmin.single as jest.Mock).mockReturnThis();
  });

  describe("GET /api/health/principles/[id]", () => {
    it("returns health principle successfully", async () => {
      // Mock successful response
      const mockPrinciple = {
        id: "test-id",
        name: "Avoid Ultra-Processed Foods",
        description: "Minimize consumption of foods with...",
        enabled: true,
      };

      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: mockPrinciple,
        error: null,
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/test-id"
      );

      // Call the endpoint
      await GET(request, { params: mockParams });

      // Verify Supabase was called correctly
      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(supabaseAdmin.select).toHaveBeenCalledWith("*");
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(mockJson).toHaveBeenCalledWith(mockPrinciple);
    });

    it("returns 404 when principle not found", async () => {
      // Mock not found response
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/nonexistent-id"
      );

      // Call the endpoint
      await GET(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to fetch health principle" },
        { status: 404 }
      );
    });

    it("returns 500 on database error", async () => {
      // Mock database error
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { message: "Database error", code: "OTHER_ERROR" },
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/test-id"
      );

      // Call the endpoint
      await GET(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to fetch health principle" },
        { status: 500 }
      );
    });

    it("handles unexpected errors", async () => {
      // Mock unexpected error
      (supabaseAdmin.from as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/test-id"
      );

      // Call the endpoint
      await GET(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Internal server error" },
        { status: 500 }
      );
    });
  });

  describe("PUT /api/health/principles/[id]", () => {
    // Helper function to create mock request
    const createMockRequest = (body: any) =>
      new Request("http://localhost/api/health/principles/test-id", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

    it("updates health principle successfully", async () => {
      // Mock successful update
      const mockUpdatedPrinciple = {
        id: "test-id",
        name: "Updated Principle",
        description: "Updated description",
        enabled: false,
      };

      (
        supabaseAdmin.from().update().eq().single as jest.Mock
      ).mockResolvedValue({
        data: mockUpdatedPrinciple,
        error: null,
      });

      // Create request with update data
      const request = createMockRequest({
        name: "Updated Principle",
        description: "Updated description",
        enabled: false,
      });

      // Call the endpoint
      await PUT(request, { params: mockParams });

      // Verify Supabase was called correctly
      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(supabaseAdmin.update).toHaveBeenCalledWith({
        name: "Updated Principle",
        description: "Updated description",
        enabled: false,
      });
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedPrinciple);
    });

    it("rejects invalid update data", async () => {
      // Create request with invalid data (empty name)
      const request = createMockRequest({
        name: "",
        enabled: false,
      });

      // Call the endpoint
      await PUT(request, { params: mockParams });

      // Verify validation error response
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Invalid data",
          details: expect.anything(),
        }),
        { status: 400 }
      );
    });

    it("returns 404 when principle not found", async () => {
      // Mock not found response
      (
        supabaseAdmin.from().update().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      // Create request with valid data
      const request = createMockRequest({
        name: "Updated Principle",
        enabled: false,
      });

      // Call the endpoint
      await PUT(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to update health principle" },
        { status: 404 }
      );
    });

    it("returns 500 on database error", async () => {
      // Mock database error
      (
        supabaseAdmin.from().update().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { message: "Database error", code: "OTHER_ERROR" },
      });

      // Create request with valid data
      const request = createMockRequest({
        name: "Updated Principle",
        enabled: false,
      });

      // Call the endpoint
      await PUT(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to update health principle" },
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
        name: "Updated Principle",
        enabled: false,
      });

      // Call the endpoint
      await PUT(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Internal server error" },
        { status: 500 }
      );
    });
  });

  describe("DELETE /api/health/principles/[id]", () => {
    it("deletes health principle successfully", async () => {
      // Setup proper mock chain for DELETE operation
      const deleteResponse = { data: { id: "test-id" }, error: null };
      const eqMock = jest.fn().mockResolvedValue(deleteResponse);
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });

      // Mock the from method to return our chain
      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        return { delete: deleteMock };
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/test-id",
        {
          method: "DELETE",
        }
      );

      // Call the endpoint
      await DELETE(request, { params: mockParams });

      // Verify Supabase was called correctly
      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it("returns 404 when principle not found", async () => {
      // Setup proper mock chain for DELETE operation with not found error
      const notFoundError = { code: "PGRST116", message: "Not found" };
      const deleteResponse = { data: null, error: notFoundError };
      const eqMock = jest.fn().mockResolvedValue(deleteResponse);
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });

      // Mock the from method to return our chain
      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        return { delete: deleteMock };
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/nonexistent-id",
        {
          method: "DELETE",
        }
      );

      // Call the endpoint
      await DELETE(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to delete health principle" },
        { status: 404 }
      );
    });

    it("returns 500 on database error", async () => {
      // Setup proper mock chain for DELETE operation with database error
      const dbError = { message: "Database error", code: "OTHER_ERROR" };
      const deleteResponse = { data: null, error: dbError };
      const eqMock = jest.fn().mockResolvedValue(deleteResponse);
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });

      // Mock the from method to return our chain
      (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
        return { delete: deleteMock };
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/test-id",
        {
          method: "DELETE",
        }
      );

      // Call the endpoint
      await DELETE(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Failed to delete health principle" },
        { status: 500 }
      );
    });

    it("handles unexpected errors", async () => {
      // Mock unexpected error
      (supabaseAdmin.from as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      // Create a mock request
      const request = new Request(
        "http://localhost/api/health/principles/test-id",
        {
          method: "DELETE",
        }
      );

      // Call the endpoint
      await DELETE(request, { params: mockParams });

      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: "Internal server error" },
        { status: 500 }
      );
    });
  });
});
