"use client";

import { useState } from "react";
import { MealCard as DesignSystemMealCard } from "@/components/features/meals/MealCard";
import { formatTime } from "@/lib/meal";
import { mealService } from "@/lib/api-services";
import { useRouter } from "next/navigation";

interface MealCardProps {
  meal: any; // Using any here to avoid conflicts with the new Meal interface
  onDelete?: () => void;
}

export default function MealCard({ meal, onDelete }: MealCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/meals/${meal.id}`);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this meal?")) {
      try {
        setIsDeleting(true);
        await mealService.deleteMeal(meal.id);
        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error("Error deleting meal:", error);
        alert("Failed to delete meal");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRatingChange = (id: string, newRatings: any) => {
    // In this context, we can't directly update the server state since this is a client component
    // The ratings will be correctly updated in the component state
    // For a true refresh, we would need to refresh the page or use a global state manager
    router.refresh();
  };

  // Format the nutrition values
  const calories = meal.nutrition?.calories || 0;
  const protein = meal.nutrition?.protein || 0;
  const carbs = meal.nutrition?.carbs || 0;
  const fat = meal.nutrition?.fat || 0;

  // Adapt meal data to the format expected by our design system component
  const adaptedMeal = {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    calories: calories,
    protein: protein,
    carbs: carbs,
    fat: fat,
    imageUrl: meal.image_url,
    // Add ratings to the meal object
    ratings: meal.ratings,
    // Additional properties we could display in the future
    prepTime: meal.prep_time,
    cookTime: meal.cook_time,
    servings: meal.servings,
  };

  return (
    <DesignSystemMealCard
      meal={adaptedMeal}
      onEdit={handleEdit}
      onDelete={handleDelete}
      showActions={true}
      showRating={true}
      onRatingChange={handleRatingChange}
    />
  );
}
