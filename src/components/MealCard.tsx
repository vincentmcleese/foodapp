"use client";

import { useState } from "react";
import { Meal } from "@/lib/api-services";
import { formatTime } from "@/lib/meal";
import { mealService } from "@/lib/api-services";
import { useRouter } from "next/navigation";

interface MealCardProps {
  meal: Meal;
  onDelete?: () => void;
}

export default function MealCard({ meal, onDelete }: MealCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const totalTime = formatTime((meal.prep_time || 0) + (meal.cook_time || 0));

  // Format the nutrition values
  const calories = meal.nutrition?.calories || 0;
  const protein = meal.nutrition?.protein || 0;
  const carbs = meal.nutrition?.carbs || 0;
  const fat = meal.nutrition?.fat || 0;

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

  return (
    <div className="card bg-white shadow-md rounded-lg overflow-hidden">
      {meal.image_url && (
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${meal.image_url})` }}
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{meal.name}</h2>

        {meal.description && (
          <p className="text-gray-600 mb-4">{meal.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {meal.prep_time && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Prep: {formatTime(meal.prep_time)}
            </span>
          )}
          {meal.cook_time && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
              Cook: {formatTime(meal.cook_time)}
            </span>
          )}
          {(meal.prep_time || meal.cook_time) && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              Total: {totalTime}
            </span>
          )}
          {meal.servings && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              Servings: {meal.servings}
            </span>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Nutrition (per serving)</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-100 p-2 rounded text-center">
              <div className="font-semibold">{calories}</div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-center">
              <div className="font-semibold">{protein}g</div>
              <div className="text-xs text-gray-500">Protein</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-center">
              <div className="font-semibold">{carbs}g</div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-center">
              <div className="font-semibold">{fat}g</div>
              <div className="text-xs text-gray-500">Fat</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
