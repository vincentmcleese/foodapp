import { ingredientService } from "@/lib/api-services";

// Mock fetch for API calls
global.fetch = jest.fn();

describe("API Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ingredientService", () => {
    describe("deleteIngredient", () => {
      it("calls the correct API endpoint with DELETE method", async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        // Call the service method
        const result = await ingredientService.deleteIngredient("test-id");

        // Verify fetch was called correctly
        expect(global.fetch).toHaveBeenCalledWith("/api/ingredients/test-id", {
          method: "DELETE",
        });

        // Verify result
        expect(result).toEqual({ success: true });
      });

      it("throws an error when API returns non-ok response", async () => {
        // Mock error response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: "Failed to delete ingredient",
          }),
        });

        // Call the service method and expect it to throw
        await expect(
          ingredientService.deleteIngredient("test-id")
        ).rejects.toThrow("Failed to delete ingredient test-id");

        // Verify fetch was called
        expect(global.fetch).toHaveBeenCalledWith("/api/ingredients/test-id", {
          method: "DELETE",
        });
      });

      it("throws an error when fetch fails", async () => {
        // Mock fetch failure
        (global.fetch as jest.Mock).mockRejectedValueOnce(
          new Error("Network error")
        );

        // Call the service method and expect it to throw
        await expect(
          ingredientService.deleteIngredient("test-id")
        ).rejects.toThrow();

        // Verify fetch was called
        expect(global.fetch).toHaveBeenCalledWith("/api/ingredients/test-id", {
          method: "DELETE",
        });
      });
    });

    // Add tests for other ingredient service methods
    describe("getAllIngredients", () => {
      it("fetches all ingredients successfully", async () => {
        const mockIngredients = [
          { id: "1", name: "Eggs" },
          { id: "2", name: "Milk" },
        ];

        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockIngredients,
        });

        // Call the service method
        const result = await ingredientService.getAllIngredients();

        // Verify fetch was called correctly
        expect(global.fetch).toHaveBeenCalledWith("/api/ingredients");

        // Verify result
        expect(result).toEqual(mockIngredients);
      });
    });

    describe("searchIngredients", () => {
      it("searches ingredients with the correct query", async () => {
        const mockResults = [{ id: "1", name: "Eggs" }];

        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResults,
        });

        // Call the service method
        const result = await ingredientService.searchIngredients("egg");

        // Verify fetch was called correctly
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/ingredients/search?q=egg"
        );

        // Verify result
        expect(result).toEqual(mockResults);
      });

      it("encodes query parameters properly", async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

        // Call with query that needs encoding
        await ingredientService.searchIngredients("egg & cheese");

        // Verify proper encoding
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/ingredients/search?q=egg%20%26%20cheese"
        );
      });
    });

    describe("generateImage", () => {
      it("posts to the correct API endpoint with proper data", async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            imageUrl: "https://example.com/image.jpg",
          }),
        });

        // Call the service method
        const result = await ingredientService.generateImage("123", "Tomato");

        // Verify fetch was called correctly
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/ingredients/generate-image",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredientId: "123", name: "Tomato" }),
          }
        );

        // Verify result
        expect(result).toEqual({
          success: true,
          imageUrl: "https://example.com/image.jpg",
        });
      });

      it("handles errors gracefully", async () => {
        // Mock error response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: "Image generation failed" }),
        });

        // Call the service method
        const result = await ingredientService.generateImage("123", "Tomato");

        // Verify error handling
        expect(result).toEqual({ success: false });
      });
    });
  });
});
