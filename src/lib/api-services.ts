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
