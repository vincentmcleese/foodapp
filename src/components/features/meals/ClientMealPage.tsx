"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Meal, MealRatingSummary, mealService } from "@/lib/api-services";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { MealRating } from "./MealRating";
import { PencilIcon, TrashIcon, ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

interface ClientMealPageProps {
  meal: Meal;
  showEdit?: boolean;
  showDelete?: boolean;
}

export function ClientMealPage({
  meal,
  showEdit = true,
  showDelete = true,
}: ClientMealPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [ratings, setRatings] = useState<MealRatingSummary>(
    meal.ratings || { likes: 0, dislikes: 0, total: 0 }
  );

  const handleEdit = () => {
    router.push(`/meals/${meal.id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this meal?")) {
      try {
        setIsDeleting(true);
        await mealService.deleteMeal(meal.id);
        toast.success("Meal deleted successfully");
        router.push("/meals");
        router.refresh();
      } catch (error) {
        console.error("Error deleting meal:", error);
        toast.error("Failed to delete meal");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRatingChange = (newRatings: MealRatingSummary) => {
    setRatings(newRatings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Meals
        </Button>

        <div className="flex gap-2">
          {showEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </Button>
          )}
          {showDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        {meal.image_url && (
          <div className="h-60 w-full -mx-6 -mt-6 mb-4">
            <img
              src={meal.image_url}
              alt={meal.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{meal.name}</h1>
          {meal.description && (
            <p className="text-gray-600 mb-4">{meal.description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            {meal.prep_time && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Prep Time</p>
                <p className="font-medium">{meal.prep_time} min</p>
              </div>
            )}
            {meal.cook_time && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Cook Time</p>
                <p className="font-medium">{meal.cook_time} min</p>
              </div>
            )}
            {meal.servings && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Servings</p>
                <p className="font-medium">{meal.servings}</p>
              </div>
            )}
          </div>

          {meal.nutrition && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Nutrition</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {meal.nutrition.calories && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Calories</p>
                    <p className="font-medium">
                      {meal.nutrition.calories} kcal
                    </p>
                  </div>
                )}
                {meal.nutrition.protein && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Protein</p>
                    <p className="font-medium">{meal.nutrition.protein}g</p>
                  </div>
                )}
                {meal.nutrition.carbs && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Carbs</p>
                    <p className="font-medium">{meal.nutrition.carbs}g</p>
                  </div>
                )}
                {meal.nutrition.fat && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Fat</p>
                    <p className="font-medium">{meal.nutrition.fat}g</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
              <ul className="space-y-2">
                {meal.ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {ing.quantity} {ing.unit}
                    </span>
                    <span className="text-gray-700">
                      {ing.ingredient?.name || "Unknown ingredient"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meal.instructions && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Instructions</h2>
              <div className="prose prose-sm max-w-none">
                {meal.instructions.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <MealRating
        mealId={meal.id}
        initialRatings={ratings}
        onRatingChange={handleRatingChange}
      />
    </div>
  );
}
