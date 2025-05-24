import { createMocks } from "node-mocks-http";
import { GET, POST } from "./route";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      return {
        status: options?.status || 200,
        json: async () => data,
      };
    }),
  },
}));

// Mock the Supabase client
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

describe("Health Principles API", () => {
  let req: ReturnType<typeof createMocks>["req"];
  let res: ReturnType<typeof createMocks>["res"];

  beforeEach(() => {
    jest.clearAllMocks();
    const mocks = createMocks();
    req = mocks.req;
    res = mocks.res;
    (NextResponse.json as jest.Mock).mockClear();
  });

  describe("GET", () => {
    it("should return a list of health principles", async () => {
      // Setup mock response
      const mockPrinciples = [
        {
          id: "1",
          name: "Avoid processed foods",
          description:
            "Processed foods often contain additives and preservatives",
          enabled: true,
        },
        {
          id: "2",
          name: "Eat more vegetables",
          description: "Vegetables provide essential nutrients",
          enabled: true,
        },
      ];

      // Setup the mock
      const orderMock = jest.fn().mockResolvedValue({
        data: mockPrinciples,
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({
        order: orderMock,
      });
      const fromMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      (supabaseAdmin.from as jest.Mock).mockImplementation(fromMock);

      // Call the API
      const response = await GET();
      const data = await response.json();

      // Assertions
      expect(fromMock).toHaveBeenCalledWith("health_principle");
      expect(selectMock).toHaveBeenCalledWith("*");
      expect(orderMock).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(data).toEqual(mockPrinciples);
    });

    it("should handle errors gracefully", async () => {
      // Setup the mock to return an error
      const orderMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });
      const selectMock = jest.fn().mockReturnValue({
        order: orderMock,
      });
      const fromMock = jest.fn().mockReturnValue({
        select: selectMock,
      });

      (supabaseAdmin.from as jest.Mock).mockImplementation(fromMock);

      // Call the API
      const response = await GET();

      // Check response
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST", () => {
    it("should create a new health principle", async () => {
      // Setup request body
      const requestBody = {
        name: "New Principle",
        description: "Description for new principle",
        enabled: true,
      };

      // Setup the mock
      const singleMock = jest.fn().mockResolvedValue({
        data: { id: "3", ...requestBody },
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({
        single: singleMock,
      });
      const insertMock = jest.fn().mockReturnValue({
        select: selectMock,
      });
      const fromMock = jest.fn().mockReturnValue({
        insert: insertMock,
      });

      (supabaseAdmin.from as jest.Mock).mockImplementation(fromMock);

      // Call the API
      const response = await POST(
        new Request("http://localhost/api/health/principles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      );
      const data = await response.json();

      // Assertions
      expect(fromMock).toHaveBeenCalledWith("health_principle");
      expect(insertMock).toHaveBeenCalledWith(requestBody);
      expect(data).toHaveProperty("id", "3");
      expect(data).toHaveProperty("name", "New Principle");
    });

    it("should handle validation errors", async () => {
      // Setup request with missing required field
      const requestBody = {
        description: "Missing name field",
        enabled: true,
      };

      // Call the API
      const response = await POST(
        new Request("http://localhost/api/health/principles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      );

      // Check response
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should handle database errors", async () => {
      // Setup request body
      const requestBody = {
        name: "Error Principle",
        description: "Will cause an error",
        enabled: true,
      };

      // Setup the mock to return an error
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
      const fromMock = jest.fn().mockReturnValue({
        insert: insertMock,
      });

      (supabaseAdmin.from as jest.Mock).mockImplementation(fromMock);

      // Call the API
      const response = await POST(
        new Request("http://localhost/api/health/principles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      );

      // Check response
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });
});
