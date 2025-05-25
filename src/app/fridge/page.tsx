"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/common/PageLayout";
import { IngredientGrid } from "@/components/features/fridge/IngredientGrid";
import { AddIngredientForm } from "@/components/features/fridge/AddIngredientForm";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function FridgePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch ingredients on page load
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        // This would be replaced with actual API call to get fridge ingredients
        const response = await fetch("/api/ingredients");
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        toast({
          title: "Error",
          description: "Failed to load ingredients",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [toast]);

  // Handle edit ingredient
  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditDialogOpen(true);
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

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  // Create a fridge item from an ingredient
  const createFridgeItemFromIngredient = (
    ingredient: Ingredient
  ): FridgeItem => {
    return {
      id: "", // This will be generated when saved
      ingredient_id: ingredient.id,
      quantity: 1,
      unit: "g",
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
      },
    };
  };

  return (
    <PageLayout
      title="My Fridge"
      subtitle="Manage your ingredients with a visual approach"
      actions={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add to Fridge</DialogTitle>
              <DialogDescription>
                Add a new ingredient to your fridge with automatic image
                generation.
              </DialogDescription>
            </DialogHeader>
            <AddIngredientForm />
          </DialogContent>
        </Dialog>
      }
    >
      <div className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="xl" />
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium mb-2">Your fridge is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some ingredients to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Your First Ingredient
            </Button>
          </div>
        ) : (
          <IngredientGrid
            ingredients={ingredients}
            onEdit={handleEditIngredient}
            onDelete={handleDeleteIngredient}
            className="mt-6"
          />
        )}
      </div>

      {/* Edit Ingredient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
