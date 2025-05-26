"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { MealCard } from "@/components/features/meals/MealCard";
import { Meal, fridgeService } from "@/lib/api-services";
import { calculateFridgePercentage } from "@/lib/meal";

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
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fridgeItems, setFridgeItems] = useState<any[]>([]);

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
        setFilteredMeals(mealsData);
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

  useEffect(() => {
    // Filter meals based on search query
    if (searchQuery.trim() === "") {
      setFilteredMeals(meals);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = meals.filter(
        (meal) =>
          meal.name.toLowerCase().includes(query) ||
          (meal.description && meal.description.toLowerCase().includes(query))
      );
      setFilteredMeals(filtered);
    }
  }, [searchQuery, meals]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMealClick = (mealId: string) => {
    onSelectMeal(mealId);
    onOpenChange(false);
  };

  // Calculate fridge percentage for a meal
  const getFridgePercentage = (meal: Meal) => {
    if (!meal.ingredients || !meal.ingredients.length || !fridgeItems.length) {
      return undefined;
    }

    return calculateFridgePercentage(meal.ingredients, fridgeItems);
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

        <div className="relative my-4">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search meals..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No meals found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onClick={handleMealClick}
                showActions={false}
                showRating={true}
                fridgePercentage={getFridgePercentage(meal)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
