"use client";

import { useState, useEffect } from "react";
import { MealCard, Meal } from "./MealCard";
import { fridgeService } from "@/lib/api-services";
import { calculateFridgePercentage } from "@/lib/meal";

interface MealCardWithFridgePercentageProps {
  meal: Meal;
  mealIngredients?: any[];
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  variant?: "default" | "highlight";
  showActions?: boolean;
  showRating?: boolean;
}

export function MealCardWithFridgePercentage({
  meal,
  mealIngredients,
  ...props
}: MealCardWithFridgePercentageProps) {
  const [fridgePercentage, setFridgePercentage] = useState<number | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function calculatePercentage() {
      try {
        // Only proceed if we have ingredients
        if (!mealIngredients || mealIngredients.length === 0) {
          setIsLoading(false);
          return;
        }

        // Make sure ingredients have the needed properties
        const validIngredients = mealIngredients.filter(
          (item) =>
            item.ingredient_id &&
            item.quantity &&
            typeof item.quantity === "number" &&
            item.ingredient
        );

        if (validIngredients.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get fridge items
        const fridgeItems = await fridgeService.getAllItems();

        // Calculate the percentage
        const percentage = calculateFridgePercentage(
          validIngredients,
          fridgeItems
        );
        setFridgePercentage(percentage);
      } catch (error) {
        console.error("Error calculating fridge percentage:", error);
      } finally {
        setIsLoading(false);
      }
    }

    calculatePercentage();
  }, [mealIngredients]);

  return (
    <MealCard meal={meal} fridgePercentage={fridgePercentage} {...props} />
  );
}
