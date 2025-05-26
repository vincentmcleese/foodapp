// API services for client-side usage

// Types based on Prisma schema
export interface Ingredient {
  id: string;
  name: string;
  usdaFdcId?: number;
  nutrition?: any;
  image_url?: string;
  image_status?: "pending" | "generating" | "completed" | "failed";
  ingredient_type: "pantry" | "regular";
  createdAt?: string;
  updatedAt?: string;
}

export interface FridgeItem {
  id: string;
  ingredient_id: string;
  quantity?: number; // Now optional for pantry items
  unit?: string; // Now optional for pantry items
  status?: "IN_STOCK" | "NOT_IN_STOCK"; // For pantry items
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
  image_status?: "pending" | "generating" | "completed" | "failed";
  created_at?: string;
  updated_at?: string;
  source?: string;
  ai_generated?: boolean;
  prepTime?: number;
  cookTime?: number;
  cuisine?: string;
  ingredients?: MealIngredient[];
  meal_ingredient?: MealIngredient[];
  healthPrinciples?: Array<{
    id: string;
    name: string;
    description?: string;
    enabled?: boolean;
  }>;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ratings?: MealRatingSummary;
}

export interface PlanEntry {
  id: string;
  meal_id: string;
  date: string; // ISO date string
  meal_type: string; // 'breakfast', 'lunch', 'dinner', 'snack'
  created_at?: string;
  updated_at?: string;
  meal?: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    image_status?: string;
    nutrition?: any;
  };
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

export interface MealRating {
  id: string;
  meal_id: string;
  rating: boolean; // true for like, false for dislike
  created_at?: string;
  updated_at?: string;
}

export interface MealRatingSummary {
  likes: number;
  dislikes: number;
  total: number;
  userRating?: boolean; // Current user's rating (if available)
}

// Add interfaces for meal recommendations
export interface MealRecommendation {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  image_url?: string;
  image_status?: "pending" | "generating" | "completed" | "failed";
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  healthPrincipleIds?: string[]; // Add this field for health principles
}

export interface RecommendationRequest {
  page?: number;
  pageSize?: number;
  cuisine?: string;
  maxPrepTime?: number;
  specificRequest?: string; // New parameter for specific user requests
  healthPrinciples?: string[]; // Add this field for filtering by health principles
  sortBy?: "fridgePercentage" | "name" | "created";
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
    item: Omit<
      FridgeItem,
      "id" | "created_at" | "updated_at" | "ingredient"
    > & {
      // Ensure at least one of these patterns is provided:
      // 1. For regular ingredients: quantity and unit
      // 2. For pantry items: status
    }
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

  /**
   * Search for ingredients using fuzzy matching
   */
  async searchIngredients(query: string): Promise<Ingredient[]> {
    const response = await fetch(
      `/api/ingredients/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to search ingredients");
    }
    const data = await response.json();
    // Extract the results array from the response
    return data.results || [];
  },

  /**
   * Create a new ingredient with image generation placeholder
   */
  async createIngredient(data: {
    name: string;
    image_status: string;
    ingredient_type: "pantry" | "regular";
  }): Promise<Ingredient> {
    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create ingredient");
    }
    return response.json();
  },

  /**
   * Delete an ingredient by ID
   */
  async deleteIngredient(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/ingredients/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      // Create a custom error with additional properties for expected error cases
      const customError = new Error(
        error.error || `Failed to delete ingredient ${id}`
      );
      // Add expected property to indicate if this is an expected error
      (customError as any).expected = error.error?.includes("used in meals");
      throw customError;
    }
    return response.json();
  },

  /**
   * Generate an image for an ingredient
   */
  async generateImage(
    ingredientId: string,
    name: string
  ): Promise<{ success: boolean; imageUrl?: string }> {
    try {
      const response = await fetch("/api/ingredients/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientId, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      return {
        success: true,
        imageUrl: data.imageUrl,
      };
    } catch (error) {
      console.error("Error generating image:", error);
      return { success: false };
    }
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

  // Rate a meal (like/dislike)
  async rateMeal(id: string, rating: boolean): Promise<MealRating> {
    const response = await fetch(`/api/meals/${id}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to rate meal ${id}`);
    }
    return response.json();
  },

  // Get meal rating summary
  async getMealRatings(id: string): Promise<MealRatingSummary> {
    const response = await fetch(`/api/meals/${id}/rating`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to get ratings for meal ${id}`);
    }
    return response.json();
  },

  /**
   * Generate an image for a meal
   */
  async generateImage(
    mealId: string,
    name: string
  ): Promise<{ success: boolean; imageUrl?: string }> {
    try {
      const response = await fetch("/api/meals/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Meal image generation failed");
      }

      return {
        success: true,
        imageUrl: data.imageUrl,
      };
    } catch (error) {
      console.error("Error generating meal image:", error);
      return { success: false };
    }
  },

  async getRecommendations(
    options: RecommendationRequest = {}
  ): Promise<MealRecommendation[]> {
    try {
      const {
        page = 1,
        pageSize = 3,
        cuisine,
        maxPrepTime,
        specificRequest,
      } = options;
      const url = new URL(
        `${window.location.origin}/api/meals/recommendations`
      );

      // Add query parameters
      url.searchParams.append("page", page.toString());
      url.searchParams.append("pageSize", pageSize.toString());
      if (cuisine) {
        url.searchParams.append("cuisine", cuisine);
      }
      if (maxPrepTime) {
        url.searchParams.append("maxPrepTime", maxPrepTime.toString());
      }
      if (specificRequest) {
        url.searchParams.append("specificRequest", specificRequest);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get meal recommendations");
      }

      return data.recommendations || [];
    } catch (error) {
      console.error("Error getting meal recommendations:", error);
      throw error;
    }
  },

  async saveMeal(
    meal: MealRecommendation,
    healthPrincipleIds?: string[]
  ): Promise<{ success: boolean; mealId: string }> {
    try {
      const mealWithHealthPrinciples = {
        ...meal,
        healthPrincipleIds: healthPrincipleIds || [],
      };

      const response = await fetch(`/api/meals/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealWithHealthPrinciples),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save meal");
      }

      return {
        success: true,
        mealId: data.mealId,
      };
    } catch (error) {
      console.error("Error saving meal:", error);
      throw error;
    }
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
