/**
 * CRUD API Test Template
 *
 * This is a comprehensive template for testing CRUD API endpoints in Next.js App Router.
 * Copy this file and adapt it for your specific resource.
 *
 * Usage:
 * 1. Copy this file to your API route directory
 * 2. Rename it to match your resource (e.g., ingredients.test.ts)
 * 3. Replace placeholder values with your specific resource data
 * 4. Implement the actual tests based on your requirements
 */

import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route"; // For collection endpoints
import { GET as GET_ITEM, PUT, DELETE } from "./[id]/route"; // For item endpoints
import { supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

/**
 * Resource Collection Tests (e.g., /api/resources)
 */
describe("Resource Collection API", () => {
  const mockRequest = new NextRequest(
    new URL("http://localhost/api/resources")
  );
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock for NextResponse.json
    jsonMock = jest.fn().mockImplementation((data) => ({ ...data }));
    (NextResponse.json as jest.Mock) = jsonMock;
  });

  describe("GET /api/resources", () => {
    it("returns 200 with all resources when successful", async () => {
      // Setup mock data
      const mockResources = [
        { id: "1", name: "Resource 1" },
        { id: "2", name: "Resource 2" },
      ];

      // Mock Supabase response
      (supabaseAdmin.from().select().order as jest.Mock).mockResolvedValue({
        data: mockResources,
        error: null,
      });

      // Call the handler
      await GET(mockRequest);

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("resource");
      expect(supabaseAdmin.select).toHaveBeenCalled();
      expect(supabaseAdmin.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(mockResources);
    });

    it("returns 500 when database error occurs", async () => {
      // Mock database error
      (supabaseAdmin.from().select().order as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler
      await GET(mockRequest);

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to fetch resources" },
        { status: 500 }
      );
    });
  });

  describe("POST /api/resources", () => {
    it("creates a new resource and returns 201 when successful", async () => {
      // Setup request body
      const requestBody = { name: "New Resource", description: "Description" };
      const mockRequest = new NextRequest(
        new URL("http://localhost/api/resources"),
        { method: "POST", body: JSON.stringify(requestBody) }
      );

      // Mock Supabase response
      const createdResource = {
        id: "new-id",
        ...requestBody,
        created_at: new Date().toISOString(),
      };
      (
        supabaseAdmin.from().insert().select().single as jest.Mock
      ).mockResolvedValue({
        data: createdResource,
        error: null,
      });

      // Call the handler
      await POST(mockRequest);

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("resource");
      expect(supabaseAdmin.insert).toHaveBeenCalledWith(requestBody);
      expect(supabaseAdmin.select).toHaveBeenCalled();

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(createdResource, { status: 201 });
    });

    it("returns 400 for invalid request body", async () => {
      // Setup invalid request
      const mockRequest = new NextRequest(
        new URL("http://localhost/api/resources"),
        { method: "POST", body: "invalid-json" }
      );

      // Call the handler
      await POST(mockRequest);

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: expect.stringContaining("Invalid request") },
        { status: 400 }
      );
    });

    it("returns 500 when database error occurs", async () => {
      // Setup request
      const requestBody = { name: "New Resource" };
      const mockRequest = new NextRequest(
        new URL("http://localhost/api/resources"),
        { method: "POST", body: JSON.stringify(requestBody) }
      );

      // Mock database error
      (
        supabaseAdmin.from().insert().select().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler
      await POST(mockRequest);

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to create resource" },
        { status: 500 }
      );
    });
  });
});

/**
 * Resource Item Tests (e.g., /api/resources/[id])
 */
describe("Resource Item API", () => {
  const mockParams = Promise.resolve({ id: "test-id" });
  const mockRequest = new NextRequest(
    new URL("http://localhost/api/resources/test-id")
  );
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock for NextResponse.json
    jsonMock = jest.fn().mockImplementation((data) => ({ ...data }));
    (NextResponse.json as jest.Mock) = jsonMock;
  });

  describe("GET /api/resources/[id]", () => {
    it("returns 200 with resource data when found", async () => {
      // Setup mock data
      const mockResource = { id: "test-id", name: "Test Resource" };

      // Mock Supabase response
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: mockResource,
        error: null,
      });

      // Call the handler
      await GET_ITEM(mockRequest, { params: mockParams });

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("resource");
      expect(supabaseAdmin.select).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(mockResource);
    });

    it("returns 404 when resource not found", async () => {
      // Mock not found response
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      // Call the handler
      await GET_ITEM(mockRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to fetch resource" },
        { status: 404 }
      );
    });
  });

  describe("PUT /api/resources/[id]", () => {
    it("updates resource and returns 200 when successful", async () => {
      // Setup request body
      const requestBody = { name: "Updated Resource" };
      const mockPutRequest = new NextRequest(
        new URL("http://localhost/api/resources/test-id"),
        { method: "PUT", body: JSON.stringify(requestBody) }
      );

      // Mock Supabase response
      const updatedResource = {
        id: "test-id",
        ...requestBody,
        updated_at: new Date().toISOString(),
      };
      (
        supabaseAdmin.from().update().eq().select().single as jest.Mock
      ).mockResolvedValue({
        data: updatedResource,
        error: null,
      });

      // Call the handler
      await PUT(mockPutRequest, { params: mockParams });

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("resource");
      expect(supabaseAdmin.update).toHaveBeenCalledWith(requestBody);
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith(updatedResource);
    });

    it("returns 400 for invalid request body", async () => {
      // Setup invalid request
      const mockPutRequest = new NextRequest(
        new URL("http://localhost/api/resources/test-id"),
        { method: "PUT", body: "invalid-json" }
      );

      // Call the handler
      await PUT(mockPutRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: expect.stringContaining("Invalid request") },
        { status: 400 }
      );
    });
  });

  describe("DELETE /api/resources/[id]", () => {
    it("deletes resource and returns 200 when successful", async () => {
      // Mock Supabase response
      (supabaseAdmin.from().delete().eq as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Verify Supabase calls
      expect(supabaseAdmin.from).toHaveBeenCalledWith("resource");
      expect(supabaseAdmin.delete).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith({ success: true });
    });

    it("returns 500 when database error occurs", async () => {
      // Mock database error
      (supabaseAdmin.from().delete().eq as jest.Mock).mockResolvedValue({
        error: { message: "Database error" },
      });

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Verify error response
      expect(jsonMock).toHaveBeenCalledWith(
        { error: "Failed to delete resource", success: false },
        { status: 500 }
      );
    });
  });
});
