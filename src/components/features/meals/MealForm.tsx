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
import { Card } from "@/components/common/Card";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, XIcon, ArrowLeftIcon, SaveIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealFormProps {
  meal?: Meal;
  isEditing?: boolean;
}

export function MealForm({ meal, isEditing = false }: MealFormProps) {
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
  const [error, setError] = useState("");

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
        setError("Failed to load ingredients. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [selectedIngredientId]);

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !quantity || !unit) {
      setError("Please fill in all ingredient fields");
      return;
    }

    const selectedIngredient = availableIngredients.find(
      (ing) => ing.id === selectedIngredientId
    );

    if (!selectedIngredient) {
      setError("Invalid ingredient selected");
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
    setError("");

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
      setError("Please enter a meal name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const mealData = {
        name,
        description,
        instructions,
        prep_time: prepTime ? parseInt(prepTime, 10) : undefined,
        cook_time: cookTime ? parseInt(cookTime, 10) : undefined,
        servings: servings ? parseInt(servings, 10) : undefined,
        image_url: imageUrl || undefined,
      };

      // Process ingredient data for creating a new meal
      const ingredientData = ingredients
        .filter((ing) => ing.ingredient_id) // Filter out invalid ingredients
        .map((ing) => ({
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          unit: ing.unit,
        }));

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
        // Create new meal with properly typed ingredients
        // Use type assertion to override type checking since we know the API accepts this format
        const mealToCreate: any = {
          ...mealData,
          ingredients: ingredientData,
        };
        await mealService.createMeal(mealToCreate);
      }

      router.push("/meals");
      router.refresh();
    } catch (error) {
      console.error("Error saving meal:", error);
      setError("Failed to save meal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card variant="outlined" className="p-4 border-error">
          <p className="text-error">{error}</p>
        </Card>
      )}

      <div className="space-y-6">
        <FormField
          id="name"
          label="Meal Name"
          error={name ? "" : "Meal name is required"}
        >
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter meal name"
            required
          />
        </FormField>

        <FormField id="description" label="Description" optional>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={2}
            placeholder="Briefly describe this meal"
          />
        </FormField>

        <FormField id="instructions" label="Instructions" optional>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={5}
            placeholder="Enter step-by-step instructions"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField id="prepTime" label="Prep Time (min)" optional>
            <Input
              id="prepTime"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              min="0"
              placeholder="0"
            />
          </FormField>

          <FormField id="cookTime" label="Cook Time (min)" optional>
            <Input
              id="cookTime"
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              min="0"
              placeholder="0"
            />
          </FormField>

          <FormField id="servings" label="Servings" optional>
            <Input
              id="servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              min="1"
              placeholder="1"
            />
          </FormField>
        </div>

        <FormField
          id="imageUrl"
          label="Image URL"
          optional
          hint="Enter a URL for the meal image"
        >
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </FormField>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">
          Ingredients
        </h3>

        {/* Current ingredients list */}
        {ingredients.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">
              Current Ingredients
            </h4>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <span>
                    {ing.quantity} {ing.unit} of{" "}
                    <span className="font-medium">
                      {ing.ingredient?.name || ing.ingredient_id}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-error"
                    leftIcon={<XIcon className="w-4 h-4" />}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new ingredient form */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-700">
            Add Ingredient
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <FormField id="ingredientId" label="Ingredient">
                <select
                  id="ingredientId"
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
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
              </FormField>
            </div>

            <FormField id="quantity" label="Quantity">
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="0.1"
                placeholder="0"
              />
            </FormField>

            <FormField id="unit" label="Unit">
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
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
            </FormField>
          </div>

          <div>
            <Button
              type="button"
              onClick={handleAddIngredient}
              disabled={!selectedIngredientId || !quantity || isLoading}
              className="mt-2"
              variant="soft"
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add Ingredient
            </Button>
          </div>
        </div>
      </Card>

      <div className="pt-6 flex justify-between">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || !name || ingredients.length === 0}
          leftIcon={<SaveIcon className="w-4 h-4" />}
        >
          {isEditing ? "Update Meal" : "Create Meal"}
        </Button>
      </div>
    </form>
  );
}
