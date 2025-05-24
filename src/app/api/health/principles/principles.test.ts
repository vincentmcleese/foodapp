import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock the supabaseAdmin
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));

describe("Health Principles API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/health/principles", () => {
    it("should return health principles", async () => {
      // Mock the supabase response
      const mockPrinciples = [
        {
          id: "1",
          name: "Avoid Ultra-Processed Foods",
          description:
            "Minimize consumption of foods with artificial additives",
          enabled: true,
        },
        {
          id: "2",
          name: "Focus on Plant-Based Foods",
          description: "Eat more vegetables, fruits, and whole grains",
          enabled: true,
        },
      ];

      (supabaseAdmin.from as jest.Mock).mockReturnThis();
      (supabaseAdmin.select as jest.Mock).mockReturnThis();
      (supabaseAdmin.order as jest.Mock).mockReturnValue({
        data: mockPrinciples,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(supabaseAdmin.select).toHaveBeenCalledWith("*");
      expect(supabaseAdmin.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(data).toEqual(mockPrinciples);
    });

    it("should handle errors gracefully", async () => {
      // Mock an error response
      (supabaseAdmin.from as jest.Mock).mockReturnThis();
      (supabaseAdmin.select as jest.Mock).mockReturnThis();
      (supabaseAdmin.order as jest.Mock).mockReturnValue({
        data: null,
        error: { message: "Database error" },
      });

      const response = await GET();
      const data = await response.json();
      const status = response.status;

      expect(status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to fetch health principles");
    });
  });

  describe("POST /api/health/principles", () => {
    it("should create a new health principle", async () => {
      const mockPrinciple = {
        name: "New Principle",
        description: "This is a new principle",
        enabled: true,
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/health/principles",
        {
          method: "POST",
          body: JSON.stringify(mockPrinciple),
        }
      );

      const mockInsertResponse = {
        data: {
          id: "123",
          ...mockPrinciple,
          created_at: new Date().toISOString(),
        },
        error: null,
      };

      (supabaseAdmin.from as jest.Mock).mockReturnThis();
      (supabaseAdmin.insert as jest.Mock).mockReturnThis();
      (supabaseAdmin.select as jest.Mock).mockReturnThis();
      (supabaseAdmin.single as jest.Mock).mockReturnValue(mockInsertResponse);

      const response = await POST(mockRequest);
      const data = await response.json();
      const status = response.status;

      expect(status).toBe(201);
      expect(data).toHaveProperty("id", "123");
      expect(data).toHaveProperty("name", "New Principle");
      expect(supabaseAdmin.from).toHaveBeenCalledWith("health_principle");
      expect(supabaseAdmin.insert).toHaveBeenCalledWith({
        name: "New Principle",
        description: "This is a new principle",
        enabled: true,
      });
    });

    it("should validate the request body", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/health/principles",
        {
          method: "POST",
          body: JSON.stringify({ description: "Missing name field" }),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();
      const status = response.status;

      expect(status).toBe(400);
      expect(data).toHaveProperty("error", "Invalid data");
    });
  });
});
