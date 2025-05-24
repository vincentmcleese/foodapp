"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Meal,
  MealIngredient,
  Ingredient,
  mealService,
  ingredientService,
} from "@/lib/api-services";

interface MealFormProps {
  meal?: Meal;
  isEditing?: boolean;
}

export default function MealForm({ meal, isEditing = false }: MealFormProps) {
  const router = useRouter();

  const [name, setName] = useState(meal?.name || "");
  const [description, setDescription] = useState(meal?.description || "");
  const [instructions, setInstructions] = useState(meal?.instructions || "");
  const [prepTime, setPrepTime] = useState(meal?.prep_time?.toString() || "");
  const [cookTime, setCookTime] = useState(meal?.cook_time?.toString() || "");
  const [servings, setServings] = useState(meal?.servings?.toString() || "");
  const [imageUrl, setImageUrl] = useState(meal?.image_url || "");
  const [ingredients, setIngredients] = useState<MealIngredient[]>(
    meal?.ingredients || []
  );

  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const ingredients = await ingredientService.getAllIngredients();
        setAvailableIngredients(ingredients);
        if (ingredients.length > 0 && !selectedIngredientId) {
          setSelectedIngredientId(ingredients[0].id);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        alert("Failed to load ingredients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [selectedIngredientId]);

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !quantity || !unit) {
      alert("Please fill in all ingredient fields");
      return;
    }

    const selectedIngredient = availableIngredients.find(
      (ing) => ing.id === selectedIngredientId
    );

    if (!selectedIngredient) {
      alert("Invalid ingredient selected");
      return;
    }

    const newIngredient: MealIngredient = {
      id: `temp-${Date.now()}`, // Temporary ID for UI purposes
      meal_id: meal?.id || "",
      ingredient_id: selectedIngredientId,
      quantity: parseFloat(quantity),
      unit,
      ingredient: selectedIngredient,
    };

    setIngredients([...ingredients, newIngredient]);

    // Reset ingredient form
    setQuantity("");
    setUnit("g");
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("Please enter a meal name");
      return;
    }

    try {
      setIsSubmitting(true);

      // For API requests, we need to extract just the ingredient data without the full MealIngredient properties
      const ingredientData = ingredients.map((ing) => ({
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit,
      }));

      const mealData = {
        name,
        description,
        instructions,
        prep_time: prepTime ? parseInt(prepTime, 10) : undefined,
        cook_time: cookTime ? parseInt(cookTime, 10) : undefined,
        servings: servings ? parseInt(servings, 10) : undefined,
        image_url: imageUrl || undefined,
      };

      if (isEditing && meal) {
        // Update existing meal
        await mealService.updateMeal(meal.id, mealData);

        // Handle ingredients updates separately
        if (meal.ingredients) {
          // Find ingredients to remove (in original but not in current)
          const ingredientsToRemove = meal.ingredients.filter(
            (oldIng) =>
              !ingredients.some(
                (newIng) =>
                  oldIng.id === newIng.id ||
                  (oldIng.ingredient_id === newIng.ingredient_id &&
                    oldIng.quantity === newIng.quantity &&
                    oldIng.unit === newIng.unit)
              )
          );

          // Find ingredients to add (in current but not in original)
          const ingredientsToAdd = ingredients.filter(
            (newIng) =>
              !meal.ingredients?.some(
                (oldIng) =>
                  oldIng.id === newIng.id ||
                  (oldIng.ingredient_id === newIng.ingredient_id &&
                    oldIng.quantity === newIng.quantity &&
                    oldIng.unit === newIng.unit)
              ) && !newIng.id.startsWith("temp-")
          );

          // Find new ingredients (with temp IDs)
          const newIngredients = ingredients.filter((ing) =>
            ing.id.startsWith("temp-")
          );

          // Process removals
          for (const ing of ingredientsToRemove) {
            await mealService.removeIngredientFromMeal(meal.id, ing.id);
          }

          // Process additions
          for (const ing of [...ingredientsToAdd, ...newIngredients]) {
            await mealService.addIngredientToMeal(meal.id, {
              ingredient_id: ing.ingredient_id,
              quantity: ing.quantity,
              unit: ing.unit,
            });
          }
        }
      } else {
        // Create new meal
        await mealService.createMeal({
          ...mealData,
          ingredients: ingredientData,
        });
      }

      router.push("/meals");
      router.refresh();
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Failed to save meal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Meal Name*
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          rows={2}
        />
      </div>

      <div>
        <label
          htmlFor="instructions"
          className="block text-sm font-medium text-gray-700"
        >
          Instructions
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          rows={5}
          placeholder="Enter step-by-step instructions..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="prepTime"
            className="block text-sm font-medium text-gray-700"
          >
            Prep Time (min)
          </label>
          <input
            type="number"
            id="prepTime"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
            min="0"
          />
        </div>

        <div>
          <label
            htmlFor="cookTime"
            className="block text-sm font-medium text-gray-700"
          >
            Cook Time (min)
          </label>
          <input
            type="number"
            id="cookTime"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
            min="0"
          />
        </div>

        <div>
          <label
            htmlFor="servings"
            className="block text-sm font-medium text-gray-700"
          >
            Servings
          </label>
          <input
            type="number"
            id="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
            min="1"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ingredients</h3>

        {/* Current ingredients list */}
        {ingredients.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Current Ingredients
            </h4>
            <ul className="space-y-2">
              {ingredients.map((ing, index) => (
                <li
                  key={ing.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span>
                    {ing.quantity} {ing.unit} of{" "}
                    {ing.ingredient?.name || ing.ingredient_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add new ingredient form */}
        <div className="grid grid-cols-4 gap-2 items-end">
          <div className="col-span-2">
            <label
              htmlFor="ingredientId"
              className="block text-sm font-medium text-gray-700"
            >
              Ingredient
            </label>
            <select
              id="ingredientId"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              disabled={isLoading || availableIngredients.length === 0}
            >
              {availableIngredients.length === 0 ? (
                <option value="">No ingredients available</option>
              ) : (
                availableIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700"
            >
              Unit
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="g">grams (g)</option>
              <option value="kg">kilograms (kg)</option>
              <option value="ml">milliliters (ml)</option>
              <option value="L">liters (L)</option>
              <option value="tsp">teaspoon (tsp)</option>
              <option value="tbsp">tablespoon (tbsp)</option>
              <option value="cup">cup</option>
              <option value="pcs">pieces</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddIngredient}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!selectedIngredientId || !quantity || isLoading}
        >
          Add Ingredient
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Meal"
            : "Create Meal"}
        </button>
      </div>
    </form>
  );
}
