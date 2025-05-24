import { mealService } from "./api-services";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Services", () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.resetAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("mealService", () => {
    const mockMeal = {
      id: "meal-1",
      name: "Test Meal",
      description: "Test description",
      prep_time: 10,
      cook_time: 20,
      servings: 2,
      ingredients: [
        {
          id: "ingredient-1",
          meal_id: "meal-1",
          ingredient_id: "ing-1",
          quantity: 100,
          unit: "g",
          ingredient: {
            id: "ing-1",
            name: "Test Ingredient",
            nutrition: {
              calories: 50,
              protein: 5,
              carbs: 10,
              fat: 2,
            },
          },
        },
      ],
      nutrition: {
        calories: 50,
        protein: 5,
        carbs: 10,
        fat: 2,
      },
    };

    it("getAllMeals should fetch all meals", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockMeal],
      });

      const meals = await mealService.getAllMeals();

      expect(global.fetch).toHaveBeenCalledWith("/api/meals");
      expect(meals).toHaveLength(1);
      expect(meals[0].id).toBe("meal-1");
    });

    it("getAllMeals should handle errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to fetch meals" }),
      });

      await expect(mealService.getAllMeals()).rejects.toThrow(
        "Failed to fetch meals"
      );
      expect(global.fetch).toHaveBeenCalledWith("/api/meals");
    });

    it("getMeal should fetch a meal by ID", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeal,
      });

      const meal = await mealService.getMeal("meal-1");

      expect(global.fetch).toHaveBeenCalledWith("/api/meals/meal-1");
      expect(meal.id).toBe("meal-1");
      expect(meal.name).toBe("Test Meal");
    });

    it("getMeal should handle errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to fetch meal invalid-id" }),
      });

      await expect(mealService.getMeal("invalid-id")).rejects.toThrow(
        "Failed to fetch meal invalid-id"
      );
      expect(global.fetch).toHaveBeenCalledWith("/api/meals/invalid-id");
    });

    it("createMeal should create a new meal", async () => {
      const newMeal = {
        name: "New Meal",
        description: "New description",
        prep_time: 5,
        cook_time: 15,
        servings: 1,
        ingredients: [
          {
            ingredient_id: "ing-1",
            quantity: 50,
            unit: "g",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newMeal, id: "new-meal-id" }),
      });

      const createdMeal = await mealService.createMeal(newMeal as any);

      expect(global.fetch).toHaveBeenCalledWith("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMeal),
      });
      expect(createdMeal.id).toBe("new-meal-id");
      expect(createdMeal.name).toBe("New Meal");
    });

    it("createMeal should handle errors", async () => {
      const newMeal = {
        name: "New Meal",
        description: "New description",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to create meal" }),
      });

      await expect(mealService.createMeal(newMeal as any)).rejects.toThrow(
        "Failed to create meal"
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/meals",
        expect.any(Object)
      );
    });

    it("updateMeal should update an existing meal", async () => {
      const mealUpdate = {
        name: "Updated Meal",
        prep_time: 15,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockMeal, ...mealUpdate }),
      });

      const updatedMeal = await mealService.updateMeal("meal-1", mealUpdate);

      expect(global.fetch).toHaveBeenCalledWith("/api/meals/meal-1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealUpdate),
      });
      expect(updatedMeal.id).toBe("meal-1");
      expect(updatedMeal.name).toBe("Updated Meal");
      expect(updatedMeal.prep_time).toBe(15);
    });

    it("updateMeal should handle errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to update meal invalid-id" }),
      });

      await expect(
        mealService.updateMeal("invalid-id", { name: "Updated Meal" })
      ).rejects.toThrow("Failed to update meal invalid-id");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/meals/invalid-id",
        expect.any(Object)
      );
    });

    it("deleteMeal should delete a meal", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await mealService.deleteMeal("meal-1");

      expect(global.fetch).toHaveBeenCalledWith("/api/meals/meal-1", {
        method: "DELETE",
      });
      expect(result.success).toBe(true);
    });

    it("deleteMeal should handle errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to delete meal invalid-id" }),
      });

      await expect(mealService.deleteMeal("invalid-id")).rejects.toThrow(
        "Failed to delete meal invalid-id"
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/meals/invalid-id",
        expect.any(Object)
      );
    });

    it("addIngredientToMeal should add an ingredient to a meal", async () => {
      const newIngredient = {
        ingredient_id: "ing-2",
        quantity: 50,
        unit: "g",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "new-ingredient-id",
          meal_id: "meal-1",
          ...newIngredient,
        }),
      });

      const result = await mealService.addIngredientToMeal(
        "meal-1",
        newIngredient
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/meals/meal-1/ingredients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newIngredient),
        }
      );
      expect(result.id).toBe("new-ingredient-id");
      expect(result.meal_id).toBe("meal-1");
      expect(result.ingredient_id).toBe("ing-2");
    });

    it("removeIngredientFromMeal should remove an ingredient from a meal", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await mealService.removeIngredientFromMeal(
        "meal-1",
        "ingredient-1"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/meals/meal-1/ingredients/ingredient-1",
        {
          method: "DELETE",
        }
      );
      expect(result.success).toBe(true);
    });
  });
});
