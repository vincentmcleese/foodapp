import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  fridgeService,
  ingredientService,
  mealService,
  FridgeItem,
  Ingredient,
  Meal,
  MealIngredient,
} from "@/lib/api-services";

// Mock server to intercept API requests
const server = setupServer(
  // Mock GET /api/fridge
  http.get("/api/fridge", () => {
    return HttpResponse.json([
      {
        id: "mock-id-1",
        ingredient_id: "ingredient-1",
        quantity: 2,
        unit: "kg",
        ingredient: {
          id: "ingredient-1",
          name: "Tomatoes",
        },
      },
    ]);
  }),

  // Mock GET /api/ingredients
  http.get("/api/ingredients", () => {
    return HttpResponse.json([
      {
        id: "ingredient-1",
        name: "Tomatoes",
      },
      {
        id: "ingredient-2",
        name: "Potatoes",
      },
    ]);
  }),

  // Mock POST /api/ingredients
  http.post("/api/ingredients", async ({ request }) => {
    const data = (await request.json()) as { name: string };
    return HttpResponse.json({
      id: "new-ingredient-id",
      name: data.name,
    });
  }),

  // Mock GET /api/fridge/:id
  http.get("/api/fridge/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      ingredient_id: "ingredient-1",
      quantity: 1,
      unit: "kg",
      ingredient: {
        id: "ingredient-1",
        name: "Tomatoes",
      },
    });
  }),

  // Mock POST /api/fridge
  http.post("/api/fridge", async ({ request }) => {
    const data = (await request.json()) as {
      ingredient_id?: string;
      quantity?: number;
      unit?: string;
    };
    return HttpResponse.json({
      id: "new-fridge-item-id",
      ingredient_id: data.ingredient_id || "",
      quantity: data.quantity || 0,
      unit: data.unit || "",
    });
  }),

  // Mock PUT /api/fridge/:id
  http.put("/api/fridge/:id", async ({ request, params }) => {
    const { id } = params;
    const data = (await request.json()) as {
      ingredient_id?: string;
      quantity?: number;
      unit?: string;
    };
    return HttpResponse.json({
      id,
      ingredient_id: data.ingredient_id || "ingredient-1",
      quantity: data.quantity || 0,
      unit: data.unit || "",
    });
  }),

  // Mock DELETE /api/fridge/:id
  http.delete("/api/fridge/:id", () => {
    return HttpResponse.json({ success: true });
  }),

  // Mock GET /api/meals
  http.get("/api/meals", () => {
    return HttpResponse.json([
      {
        id: "meal-1",
        name: "Spaghetti Bolognese",
        description: "Classic Italian pasta dish",
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        ingredients: [
          {
            id: "meal-ingredient-1",
            meal_id: "meal-1",
            ingredient_id: "ingredient-1",
            quantity: 200,
            unit: "g",
            ingredient: {
              id: "ingredient-1",
              name: "Tomatoes",
              nutrition: {
                calories: 18,
                protein: 0.9,
                carbs: 3.9,
                fat: 0.2,
              },
            },
          },
        ],
        nutrition: {
          calories: 36,
          protein: 1.8,
          carbs: 7.8,
          fat: 0.4,
        },
      },
    ]);
  }),

  // Mock GET /api/meals/:id
  http.get("/api/meals/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: "Spaghetti Bolognese",
      description: "Classic Italian pasta dish",
      instructions: "1. Cook pasta\n2. Make sauce\n3. Combine",
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      ingredients: [
        {
          id: "meal-ingredient-1",
          meal_id: id,
          ingredient_id: "ingredient-1",
          quantity: 200,
          unit: "g",
          ingredient: {
            id: "ingredient-1",
            name: "Tomatoes",
            nutrition: {
              calories: 18,
              protein: 0.9,
              carbs: 3.9,
              fat: 0.2,
            },
          },
        },
      ],
      nutrition: {
        calories: 36,
        protein: 1.8,
        carbs: 7.8,
        fat: 0.4,
      },
    });
  }),

  // Mock POST /api/meals
  http.post("/api/meals", async ({ request }) => {
    const data = (await request.json()) as {
      name: string;
      description?: string;
      instructions?: string;
      prep_time?: number;
      cook_time?: number;
      servings?: number;
      ingredients?: any[];
    };
    return HttpResponse.json({
      id: "new-meal-id",
      name: data.name || "",
      description: data.description || "",
      instructions: data.instructions || "",
      prep_time: data.prep_time || 0,
      cook_time: data.cook_time || 0,
      servings: data.servings || 0,
      ingredients: data.ingredients || [],
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    });
  }),

  // Mock PUT /api/meals/:id
  http.put("/api/meals/:id", async ({ request, params }) => {
    const { id } = params;
    const data = (await request.json()) as {
      name?: string;
      description?: string;
      instructions?: string;
      prep_time?: number;
      cook_time?: number;
      servings?: number;
      ingredients?: any[];
    };
    return HttpResponse.json({
      id,
      name: data.name || "Updated Meal",
      description: data.description || "",
      instructions: data.instructions || "",
      prep_time: data.prep_time || 0,
      cook_time: data.cook_time || 0,
      servings: data.servings || 0,
      ingredients: data.ingredients || [],
      nutrition: {
        calories: 36,
        protein: 1.8,
        carbs: 7.8,
        fat: 0.4,
      },
    });
  }),

  // Mock DELETE /api/meals/:id
  http.delete("/api/meals/:id", () => {
    return HttpResponse.json({ success: true });
  }),

  // Mock POST /api/meals/:id/ingredients
  http.post("/api/meals/:id/ingredients", async ({ request, params }) => {
    const { id } = params;
    const data = (await request.json()) as {
      ingredient_id: string;
      quantity: number;
      unit: string;
    };
    return HttpResponse.json({
      id: "new-meal-ingredient-id",
      meal_id: id,
      ingredient_id: data.ingredient_id,
      quantity: data.quantity,
      unit: data.unit,
    });
  }),

  // Mock DELETE /api/meals/:id/ingredients/:ingredientId
  http.delete("/api/meals/:id/ingredients/:ingredientId", () => {
    return HttpResponse.json({ success: true });
  })
);

// Start server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe("Fridge Service", () => {
  it("should fetch all fridge items", async () => {
    const items = await fridgeService.getAllItems();
    expect(items).toHaveLength(1);
    expect(items[0].ingredient_id).toBe("ingredient-1");
    expect(items[0].quantity).toBe(2);
    expect(items[0].unit).toBe("kg");
  });

  it("should fetch a single fridge item by ID", async () => {
    const item = await fridgeService.getItem("test-id");
    expect(item.id).toBe("test-id");
    expect(item.ingredient_id).toBe("ingredient-1");
    expect(item.quantity).toBe(1);
    expect(item.unit).toBe("kg");
  });

  it("should add a new fridge item", async () => {
    const newItem = {
      ingredient_id: "ingredient-2",
      quantity: 3,
      unit: "kg",
    };
    const addedItem = await fridgeService.addItem(newItem);
    expect(addedItem.id).toBe("new-fridge-item-id");
    expect(addedItem.ingredient_id).toBe("ingredient-2");
    expect(addedItem.quantity).toBe(3);
    expect(addedItem.unit).toBe("kg");
  });

  it("should update a fridge item", async () => {
    const updatedItem = await fridgeService.updateItem("test-id", {
      quantity: 5,
      unit: "kg",
    });
    expect(updatedItem.id).toBe("test-id");
    expect(updatedItem.ingredient_id).toBe("ingredient-1");
    expect(updatedItem.quantity).toBe(5);
    expect(updatedItem.unit).toBe("kg");
  });

  it("should delete a fridge item", async () => {
    const result = await fridgeService.deleteItem("test-id");
    expect(result.success).toBe(true);
  });
});

describe("Ingredient Service", () => {
  it("should fetch all ingredients", async () => {
    const ingredients = await ingredientService.getAllIngredients();
    expect(ingredients).toHaveLength(2);
    expect(ingredients[0].id).toBe("ingredient-1");
    expect(ingredients[0].name).toBe("Tomatoes");
    expect(ingredients[1].id).toBe("ingredient-2");
    expect(ingredients[1].name).toBe("Potatoes");
  });

  it("should add a new ingredient", async () => {
    const newIngredient = {
      name: "Carrots",
    };
    const addedIngredient = await ingredientService.addIngredient(
      newIngredient
    );
    expect(addedIngredient.id).toBe("new-ingredient-id");
    expect(addedIngredient.name).toBe("Carrots");
  });
});

describe("Meal Service", () => {
  it("should fetch all meals", async () => {
    const meals = await mealService.getAllMeals();
    expect(meals).toHaveLength(1);
    expect(meals[0].id).toBe("meal-1");
    expect(meals[0].name).toBe("Spaghetti Bolognese");
    expect(meals[0].ingredients).toHaveLength(1);
    expect(meals[0].nutrition).toBeDefined();
  });

  it("should fetch a single meal by ID", async () => {
    const meal = await mealService.getMeal("test-meal-id");
    expect(meal.id).toBe("test-meal-id");
    expect(meal.name).toBe("Spaghetti Bolognese");
    expect(meal.ingredients).toHaveLength(1);
    expect(meal.nutrition).toBeDefined();
  });

  it("should create a new meal", async () => {
    const newMeal = {
      name: "Vegetable Stir Fry",
      description: "Healthy vegetable stir fry",
      instructions: "1. Chop vegetables\n2. Stir fry",
      prep_time: 10,
      cook_time: 15,
      servings: 2,
      ingredients: [],
    };
    const createdMeal = await mealService.createMeal(newMeal);
    expect(createdMeal.id).toBe("new-meal-id");
    expect(createdMeal.name).toBe("Vegetable Stir Fry");
    expect(createdMeal.nutrition).toBeDefined();
  });

  it("should update a meal", async () => {
    const updatedMeal = await mealService.updateMeal("test-meal-id", {
      name: "Updated Spaghetti Bolognese",
      prep_time: 20,
    });
    expect(updatedMeal.id).toBe("test-meal-id");
    expect(updatedMeal.name).toBe("Updated Spaghetti Bolognese");
    expect(updatedMeal.prep_time).toBe(20);
  });

  it("should delete a meal", async () => {
    const result = await mealService.deleteMeal("test-meal-id");
    expect(result.success).toBe(true);
  });

  it("should add an ingredient to a meal", async () => {
    const newMealIngredient = {
      ingredient_id: "ingredient-2",
      quantity: 150,
      unit: "g",
    };
    const addedIngredient = await mealService.addIngredientToMeal(
      "test-meal-id",
      newMealIngredient
    );
    expect(addedIngredient.id).toBe("new-meal-ingredient-id");
    expect(addedIngredient.meal_id).toBe("test-meal-id");
    expect(addedIngredient.ingredient_id).toBe("ingredient-2");
    expect(addedIngredient.quantity).toBe(150);
  });

  it("should remove an ingredient from a meal", async () => {
    const result = await mealService.removeIngredientFromMeal(
      "test-meal-id",
      "meal-ingredient-1"
    );
    expect(result.success).toBe(true);
  });
});
