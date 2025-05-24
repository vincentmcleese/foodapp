// API services for client-side usage

// Types based on Prisma schema
export interface Ingredient {
  id: string;
  name: string;
  usda_fdc_id?: number;
  nutrition?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface FridgeItem {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  ingredient?: Ingredient;
}

export interface MealIngredient {
  id: string;
  meal_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  created_at?: string;
  updated_at?: string;
  ingredient?: Ingredient;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  ingredients?: MealIngredient[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface PlanEntry {
  id: string;
  meal_id: string;
  date: string; // ISO date string
  meal_type: string; // 'breakfast', 'lunch', 'dinner', 'snack'
  created_at?: string;
  updated_at?: string;
  meal?: Meal;
}

export interface HealthPrinciple {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  required: number;
  unit: string;
  inStock: number;
  status: "need-to-buy" | "partial" | "in-stock";
}

export interface ShoppingList {
  shoppingList: ShoppingItem[];
  totalItems: number;
  needToBuy: number;
  partial: number;
  inStock: number;
}

// Fridge Item API Service
export const fridgeService = {
  // Get all fridge items
  async getAllItems(): Promise<FridgeItem[]> {
    const response = await fetch("/api/fridge");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch fridge items");
    }
    return response.json();
  },

  // Get a single fridge item by ID
  async getItem(id: string): Promise<FridgeItem> {
    const response = await fetch(`/api/fridge/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch fridge item ${id}`);
    }
    return response.json();
  },

  // Add a new fridge item
  async addItem(
    item: Omit<FridgeItem, "id" | "created_at" | "updated_at" | "ingredient">
  ): Promise<FridgeItem> {
    const response = await fetch("/api/fridge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add fridge item");
    }
    return response.json();
  },

  // Update a fridge item
  async updateItem(
    id: string,
    item: Partial<
      Omit<FridgeItem, "id" | "created_at" | "updated_at" | "ingredient">
    >
  ): Promise<FridgeItem> {
    const response = await fetch(`/api/fridge/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update fridge item ${id}`);
    }
    return response.json();
  },

  // Delete a fridge item
  async deleteItem(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/fridge/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete fridge item ${id}`);
    }
    return response.json();
  },
};

// Ingredient API Service
export const ingredientService = {
  // Get all ingredients
  async getAllIngredients(): Promise<Ingredient[]> {
    const response = await fetch("/api/ingredients");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch ingredients");
    }
    return response.json();
  },

  // Add a new ingredient
  async addIngredient(
    ingredient: Omit<Ingredient, "id" | "created_at" | "updated_at">
  ): Promise<Ingredient> {
    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ingredient),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add ingredient");
    }
    return response.json();
  },
};

// Meal API Service
export const mealService = {
  // Get all meals
  async getAllMeals(): Promise<Meal[]> {
    const response = await fetch("/api/meals");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch meals");
    }
    return response.json();
  },

  // Get a single meal by ID
  async getMeal(id: string): Promise<Meal> {
    const response = await fetch(`/api/meals/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch meal ${id}`);
    }
    return response.json();
  },

  // Create a new meal
  async createMeal(
    meal: Omit<Meal, "id" | "created_at" | "updated_at" | "nutrition"> & {
      ingredients?: Array<{
        ingredient_id: string;
        quantity: number;
        unit: string;
      }>;
    }
  ): Promise<Meal> {
    const response = await fetch("/api/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meal),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create meal");
    }
    return response.json();
  },

  // Update a meal
  async updateMeal(
    id: string,
    meal: Partial<
      Omit<
        Meal,
        "id" | "created_at" | "updated_at" | "nutrition" | "ingredients"
      >
    >
  ): Promise<Meal> {
    const response = await fetch(`/api/meals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meal),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update meal ${id}`);
    }
    return response.json();
  },

  // Delete a meal
  async deleteMeal(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/meals/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete meal ${id}`);
    }
    return response.json();
  },

  // Add ingredient to a meal
  async addIngredientToMeal(
    mealId: string,
    mealIngredient: Omit<
      MealIngredient,
      "id" | "meal_id" | "created_at" | "updated_at" | "ingredient"
    >
  ): Promise<MealIngredient> {
    const response = await fetch(`/api/meals/${mealId}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mealIngredient),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Failed to add ingredient to meal ${mealId}`
      );
    }
    return response.json();
  },

  // Remove ingredient from a meal
  async removeIngredientFromMeal(
    mealId: string,
    ingredientId: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `/api/meals/${mealId}/ingredients/${ingredientId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Failed to remove ingredient from meal ${mealId}`
      );
    }
    return response.json();
  },
};

// Plan API Service
export const planService = {
  // Get all plan entries
  async getAllEntries(): Promise<PlanEntry[]> {
    const response = await fetch("/api/plan");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch plan entries");
    }
    return response.json();
  },

  // Get a single plan entry by ID
  async getEntry(id: string): Promise<PlanEntry> {
    const response = await fetch(`/api/plan/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch plan entry ${id}`);
    }
    return response.json();
  },

  // Create a new plan entry
  async createEntry(
    entry: Omit<PlanEntry, "id" | "created_at" | "updated_at" | "meal">
  ): Promise<PlanEntry> {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create plan entry");
    }
    return response.json();
  },

  // Update a plan entry
  async updateEntry(
    id: string,
    entry: Partial<Omit<PlanEntry, "id" | "created_at" | "updated_at" | "meal">>
  ): Promise<PlanEntry> {
    const response = await fetch(`/api/plan/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update plan entry ${id}`);
    }
    return response.json();
  },

  // Delete a plan entry
  async deleteEntry(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/plan/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete plan entry ${id}`);
    }
    return response.json();
  },
};

// Health Principle API Service
export const healthService = {
  // Get all health principles
  async getAllPrinciples(): Promise<HealthPrinciple[]> {
    const response = await fetch("/api/health/principles");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch health principles");
    }
    return response.json();
  },

  // Get a single health principle by ID
  async getPrinciple(id: string): Promise<HealthPrinciple> {
    const response = await fetch(`/api/health/principles/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch health principle ${id}`);
    }
    return response.json();
  },

  // Create a new health principle
  async createPrinciple(
    principle: Omit<HealthPrinciple, "id" | "created_at" | "updated_at">
  ): Promise<HealthPrinciple> {
    const response = await fetch("/api/health/principles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(principle),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create health principle");
    }
    return response.json();
  },

  // Update a health principle
  async updatePrinciple(
    id: string,
    principle: Partial<
      Omit<HealthPrinciple, "id" | "created_at" | "updated_at">
    >
  ): Promise<HealthPrinciple> {
    const response = await fetch(`/api/health/principles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(principle),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update health principle ${id}`);
    }
    return response.json();
  },

  // Toggle a health principle's enabled status
  async togglePrinciple(
    id: string,
    enabled: boolean
  ): Promise<HealthPrinciple> {
    return this.updatePrinciple(id, { enabled });
  },

  // Delete a health principle
  async deletePrinciple(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/health/principles/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete health principle ${id}`);
    }
    return response.json();
  },
};

// Shopping List API Service
export const shoppingService = {
  // Get shopping list based on meal plan and fridge inventory
  async getShoppingList(): Promise<ShoppingList> {
    const response = await fetch("/api/shopping");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch shopping list");
    }
    return response.json();
  },
};
