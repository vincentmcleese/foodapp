import { ingredientService, Ingredient } from "@/lib/api-services";

// Mock fetch globally
global.fetch = jest.fn();

describe("ingredientService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllIngredients", () => {
    it("returns ingredients when API call is successful", async () => {
      // Mock successful response
      const mockIngredients: Ingredient[] = [
        { id: "1", name: "Tomatoes" },
        { id: "2", name: "Onions" },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockIngredients,
      });

      // Call the service method
      const result = await ingredientService.getAllIngredients();

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith("/api/ingredients");

      // Verify the result
      expect(result).toEqual(mockIngredients);
    });

    it("throws an error when API call fails", async () => {
      // Mock failed response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Failed to fetch ingredients" }),
      });

      // Call the service method and expect it to throw
      await expect(ingredientService.getAllIngredients()).rejects.toThrow(
        "Failed to fetch ingredients"
      );

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledWith("/api/ingredients");
    });
  });

  describe("addIngredient", () => {
    const newIngredient = {
      name: "New Ingredient",
      image_status: "pending" as const,
    };

    it("returns the created ingredient when API call is successful", async () => {
      // Mock successful response
      const mockCreatedIngredient: Ingredient = {
        id: "new-id",
        name: "New Ingredient",
        image_status: "pending",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCreatedIngredient,
      });

      // Call the service method
      const result = await ingredientService.addIngredient(newIngredient);

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIngredient),
      });

      // Verify the result
      expect(result).toEqual(mockCreatedIngredient);
    });

    it("throws an error when API call fails", async () => {
      // Mock failed response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Failed to add ingredient" }),
      });

      // Call the service method and expect it to throw
      await expect(
        ingredientService.addIngredient(newIngredient)
      ).rejects.toThrow("Failed to add ingredient");

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ingredients",
        expect.any(Object)
      );
    });
  });

  describe("searchIngredients", () => {
    it("returns search results when API call is successful", async () => {
      // Mock successful response
      const mockResults = {
        results: [
          { id: "1", name: "Tomatoes" },
          { id: "2", name: "Cherry Tomatoes" },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResults,
      });

      // Call the service method
      const result = await ingredientService.searchIngredients("tomato");

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ingredients/search?q=tomato"
      );

      // Verify the result
      expect(result).toEqual(mockResults);
    });

    it("throws an error when API call fails", async () => {
      // Mock failed response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Failed to search ingredients" }),
      });

      // Call the service method and expect it to throw
      await expect(
        ingredientService.searchIngredients("tomato")
      ).rejects.toThrow("Failed to search ingredients");

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ingredients/search?q=tomato"
      );
    });
  });

  describe("deleteIngredient", () => {
    it("returns success when API call is successful", async () => {
      // Mock successful response
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Call the service method
      const result = await ingredientService.deleteIngredient("1");

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith("/api/ingredients/1", {
        method: "DELETE",
      });

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it("throws an error when API call fails", async () => {
      // Mock failed response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Failed to delete ingredient" }),
      });

      // Call the service method and expect it to throw
      await expect(ingredientService.deleteIngredient("1")).rejects.toThrow(
        "Failed to delete ingredient"
      );

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledWith("/api/ingredients/1", {
        method: "DELETE",
      });
    });
  });
});
