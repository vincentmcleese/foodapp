"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Clock as ClockIcon,
  Users as UsersIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { MealRecommendation } from "@/lib/api-services";
import { MealImage } from "./MealImage";
import { cn } from "@/lib/utils";

interface MealRecommendationCardProps {
  meal: MealRecommendation;
  onSave: (meal: MealRecommendation) => void;
  isSaving?: boolean;
}

export function MealRecommendationCard({
  meal,
  onSave,
  isSaving = false,
}: MealRecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSave = () => {
    if (!isSaving) {
      onSave(meal);
    }
  };

  // Format nutrition values
  const nutrition = meal.nutrition || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  // Create a nutrition summary component
  const NutritionItem = ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: number;
    unit: string;
  }) => (
    <div className="text-center">
      <div className="font-medium text-lg">{value}</div>
      <div className="text-xs text-gray-500">
        {label} ({unit})
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-indigo-100">
      <div className="h-44 w-full">
        <MealImage
          imageUrl={meal.image_url}
          status={meal.image_status || "pending"}
          name={meal.name}
          width={400}
          height={176}
          className="h-full w-full"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{meal.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {meal.description}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 px-2 py-1 text-xs"
          >
            {meal.cuisine}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center mr-4">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{meal.prepTime + meal.cookTime} min</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-1" />
            <span>{meal.servings} servings</span>
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Nutrition</h4>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <NutritionItem
              label="Calories"
              value={Math.round(nutrition.calories)}
              unit="kcal"
            />
            <NutritionItem
              label="Protein"
              value={Math.round(nutrition.protein)}
              unit="g"
            />
            <NutritionItem
              label="Carbs"
              value={Math.round(nutrition.carbs)}
              unit="g"
            />
            <NutritionItem
              label="Fat"
              value={Math.round(nutrition.fat)}
              unit="g"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Ingredients</h4>
          <ul className="text-sm space-y-1 ml-1">
            {meal.ingredients
              .slice(0, expanded ? meal.ingredients.length : 3)
              .map((ingredient, idx) => (
                <li key={`${meal.id}-ing-${idx}`} className="flex items-start">
                  <span className="text-gray-800">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            {meal.ingredients.length > 3 && !expanded && (
              <li
                className="text-indigo-600 cursor-pointer flex items-center text-xs"
                onClick={() => setExpanded(true)}
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {meal.ingredients.length - 3} more ingredients
              </li>
            )}
            {expanded && (
              <li
                className="text-indigo-600 cursor-pointer flex items-center text-xs"
                onClick={() => setExpanded(false)}
              >
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </li>
            )}
          </ul>
        </div>

        {expanded && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Instructions</h4>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {meal.instructions}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 pb-3 flex-shrink-0">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save to My Meals"}
        </Button>
      </CardFooter>
    </Card>
  );
}
