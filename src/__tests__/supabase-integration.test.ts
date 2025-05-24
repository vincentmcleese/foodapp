import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  fridgeService,
  ingredientService,
  FridgeItem,
  Ingredient,
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

  // Mock POST /api/fridge
  http.post("/api/fridge", async ({ request }) => {
    const body = (await request.json()) as Partial<FridgeItem>;
    return HttpResponse.json({
      id: "new-mock-id",
      ingredient_id: body.ingredient_id || "",
      quantity: body.quantity || 0,
      unit: body.unit || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // Mock PUT /api/fridge/:id
  http.put("/api/fridge/:id", async ({ params, request }) => {
    const id = params.id as string;
    const body = (await request.json()) as Partial<FridgeItem>;
    return HttpResponse.json({
      id,
      ingredient_id: body.ingredient_id,
      quantity: body.quantity,
      unit: body.unit,
      updated_at: new Date().toISOString(),
    });
  }),

  // Mock DELETE /api/fridge/:id
  http.delete("/api/fridge/:id", () => {
    return HttpResponse.json({ success: true });
  }),

  // Mock POST /api/ingredients
  http.post("/api/ingredients", async ({ request }) => {
    const body = (await request.json()) as Partial<Ingredient>;
    return HttpResponse.json({
      id: "new-ingredient-id",
      name: body.name || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

describe("Fridge Service Integration", () => {
  test("getAllItems should fetch fridge items with ingredients", async () => {
    const items = await fridgeService.getAllItems();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("mock-id-1");
    expect(items[0].ingredient?.name).toBe("Tomatoes");
  });

  test("addItem should create a new fridge item", async () => {
    const newItem = await fridgeService.addItem({
      ingredient_id: "ingredient-2",
      quantity: 5,
      unit: "pcs",
    });

    expect(newItem.id).toBe("new-mock-id");
    expect(newItem.ingredient_id).toBe("ingredient-2");
    expect(newItem.quantity).toBe(5);
    expect(newItem.unit).toBe("pcs");
  });

  test("updateItem should update an existing fridge item", async () => {
    const updatedItem = await fridgeService.updateItem("mock-id-1", {
      quantity: 3,
      unit: "kg",
    });

    expect(updatedItem.id).toBe("mock-id-1");
    expect(updatedItem.quantity).toBe(3);
    expect(updatedItem.unit).toBe("kg");
  });

  test("deleteItem should remove a fridge item", async () => {
    const result = await fridgeService.deleteItem("mock-id-1");
    expect(result.success).toBe(true);
  });
});

describe("Ingredient Service Integration", () => {
  test("getAllIngredients should fetch all ingredients", async () => {
    const ingredients = await ingredientService.getAllIngredients();
    expect(ingredients).toHaveLength(2);
    expect(ingredients[0].name).toBe("Tomatoes");
    expect(ingredients[1].name).toBe("Potatoes");
  });

  test("addIngredient should create a new ingredient", async () => {
    const newIngredient = await ingredientService.addIngredient({
      name: "Carrots",
    });

    expect(newIngredient.id).toBe("new-ingredient-id");
    expect(newIngredient.name).toBe("Carrots");
  });
});
