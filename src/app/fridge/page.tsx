"use client";

import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/components/common/PageLayout";
import { IngredientGrid } from "@/components/features/fridge/IngredientGrid";
import { FridgeSearch } from "@/components/features/fridge/FridgeSearch";
import {
  FridgeItemForm,
  FridgeItem,
} from "@/components/features/fridge/FridgeItemForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Ingredient, ingredientService } from "@/lib/api-services";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function FridgePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Function to fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch ingredients
      const ingredientsResponse = await fetch("/api/ingredients");
      const ingredientsData = await ingredientsResponse.json();

      // Fetch fridge items
      const fridgeResponse = await fetch("/api/fridge");
      const fridgeData = await fridgeResponse.json();
      setFridgeItems(fridgeData);

      // Filter ingredients to only show those that are in the fridge
      const fridgeIngredientIds = fridgeData.map(
        (item: FridgeItem) => item.ingredient_id
      );
      const fridgeIngredients = ingredientsData.filter(
        (ingredient: Ingredient) => fridgeIngredientIds.includes(ingredient.id)
      );
      setIngredients(fridgeIngredients);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch ingredients on page load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh when an item is added
  const handleItemAdded = useCallback(() => {
    console.log("Item added, refreshing data...");
    fetchData();
  }, [fetchData]);

  // Handle edit ingredient
  const handleEditIngredient = async (ingredient: Ingredient) => {
    try {
      // Find existing fridge items for this ingredient
      const existingItems = fridgeItems.filter(
        (item) => item.ingredient_id === ingredient.id
      );

      if (existingItems.length > 0) {
        // Use the existing fridge item
        setSelectedIngredient(ingredient);
        setIsEditDialogOpen(true);
      } else {
        // Create a new fridge item since one doesn't exist
        const newFridgeItem = {
          ingredient_id: ingredient.id,
          quantity: 1,
          unit: "g",
        };

        // Add it to the database first
        const createResponse = await fetch("/api/fridge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFridgeItem),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create fridge item");
        }

        const createdItem = await createResponse.json();
        setFridgeItems([...fridgeItems, createdItem]);

        // Now use this item for editing
        setSelectedIngredient(ingredient);
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      console.error("Error preparing ingredient for edit:", error);
      toast({
        title: "Error",
        description: "Failed to prepare ingredient for editing",
        variant: "destructive",
      });
    }
  };

  // Handle delete ingredient
  const handleDeleteIngredient = async (id: string) => {
    try {
      // Actually call the API to delete the ingredient
      await ingredientService.deleteIngredient(id);

      // Update local state after successful API call
      setIngredients(ingredients.filter((ing) => ing.id !== id));

      toast({
        title: "Success",
        description: "Ingredient removed from fridge",
      });

      // Refresh the data
      handleItemAdded();
    } catch (error: any) {
      // Check if this is an expected error (like ingredient used in meals)
      const isExpectedError = error.expected === true;
      const errorMessage = error.message || "Failed to delete ingredient";
      const isUsedInMeals = errorMessage.includes("used in meals");

      // Only log unexpected errors to console
      if (!isExpectedError) {
        console.error("Error deleting ingredient:", error);
      }

      toast({
        title: isUsedInMeals ? "Cannot Delete" : "Error",
        description: isUsedInMeals
          ? "This ingredient is used in one or more meals. Remove it from those meals first."
          : "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  // Create a fridge item from an ingredient
  const createFridgeItemFromIngredient = (
    ingredient: Ingredient
  ): FridgeItem => {
    // First try to find an existing fridge item for this ingredient
    const existingFridgeItem = fridgeItems.find(
      (item: FridgeItem) => item.ingredient_id === ingredient.id
    );

    if (existingFridgeItem) {
      return existingFridgeItem;
    }

    // If we couldn't find one, we'll use default values
    // The form submission will create a new one
    return {
      id: `temp-${ingredient.id}`, // Temporary ID to be replaced on save
      ingredient_id: ingredient.id,
      quantity: ingredient.ingredient_type === "regular" ? 1 : undefined,
      unit: ingredient.ingredient_type === "regular" ? "g" : undefined,
      status: ingredient.ingredient_type === "pantry" ? "IN_STOCK" : undefined,
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        ingredient_type: ingredient.ingredient_type,
      },
    };
  };

  return (
    <PageLayout
      title="My Fridge"
      subtitle="Manage your ingredients with a visual approach"
    >
      <div className="container mx-auto p-4 space-y-6">
        {/* Search component is now at the top */}
        <div className="mb-8">
          <FridgeSearch onItemAdded={handleItemAdded} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="xl" />
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium mb-2">Your fridge is empty</h3>
            <p className="text-muted-foreground mb-6">
              Search for ingredients to add them to your fridge
            </p>
          </div>
        ) : (
          <IngredientGrid
            ingredients={ingredients}
            fridgeItems={fridgeItems}
            onEdit={handleEditIngredient}
            onDelete={handleDeleteIngredient}
            className="mt-6"
          />
        )}
      </div>

      {/* Edit Ingredient Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Refresh data when dialog closes
            handleItemAdded();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update the details for {selectedIngredient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedIngredient && (
            <FridgeItemForm
              isEditing={true}
              fridgeItem={createFridgeItemFromIngredient(selectedIngredient)}
              onSubmitSuccess={handleItemAdded}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
