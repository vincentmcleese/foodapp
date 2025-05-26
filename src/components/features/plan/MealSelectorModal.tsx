"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MealCard } from "@/components/features/meals/MealCard";
import { Meal, fridgeService, RecommendationRequest } from "@/lib/api-services";
import { calculateFridgePercentage, applyMealFilters } from "@/lib/meal";
import { MealFilter } from "@/components/features/meals/MealFilter";

interface MealSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMeal: (mealId: string) => void;
}

export function MealSelectorModal({
  open,
  onOpenChange,
  onSelectMeal,
}: MealSelectorModalProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fridgeItems, setFridgeItems] = useState<any[]>([]);
  const [filters, setFilters] = useState<RecommendationRequest>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch meals and fridge items in parallel
        const [mealsResponse, fridgeItemsResponse] = await Promise.all([
          fetch("/api/meals"),
          fridgeService.getAllItems(),
        ]);

        if (!mealsResponse.ok) {
          throw new Error("Failed to fetch meals");
        }

        const mealsData = await mealsResponse.json();
        setMeals(mealsData);
        setFridgeItems(fridgeItemsResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchData();
    }
  }, [open]);

  // Apply filters to meals
  const filteredMeals = applyMealFilters(meals, filters, fridgeItems);

  const handleMealClick = (mealId: string) => {
    onSelectMeal(mealId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Meal</DialogTitle>
          <DialogDescription>
            Choose a meal to add to your plan
          </DialogDescription>
        </DialogHeader>

        <MealFilter onFilterChange={setFilters} className="mt-4" />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No meals found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={{
                  id: meal.id,
                  name: meal.name,
                  description: meal.description,
                  calories: meal.nutrition?.calories,
                  protein: meal.nutrition?.protein,
                  carbs: meal.nutrition?.carbs,
                  fat: meal.nutrition?.fat,
                  image_url: meal.image_url,
                  image_status: meal.image_status,
                }}
                onClick={handleMealClick}
                showActions={false}
                showRating={true}
                fridgePercentage={
                  meal.meal_ingredient?.length
                    ? calculateFridgePercentage(
                        meal.meal_ingredient,
                        fridgeItems
                      )
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
