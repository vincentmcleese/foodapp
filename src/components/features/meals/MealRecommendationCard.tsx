"use client";

import { useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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

  return (
    <Card className={cn("overflow-hidden")}>
      <div className="flex flex-col gap-4">
        <div className="h-40 w-full -mx-6 -mt-6 mb-2 relative">
          <MealImage
            imageUrl={null}
            status="pending"
            name={meal.name}
            width={400}
            height={160}
            className="h-full w-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-60">
            <p className="text-sm text-gray-700 font-medium px-4 py-2 bg-white rounded-md shadow-sm">
              Save to create image
            </p>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-neutral-800">
              {meal.name}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">{meal.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <NutritionInfo
            label="Calories"
            value={`${Math.round(nutrition.calories)} kcal`}
          />
          <NutritionInfo
            label="Protein"
            value={`${Math.round(nutrition.protein)}g`}
          />
          <NutritionInfo
            label="Carbs"
            value={`${Math.round(nutrition.carbs)}g`}
          />
          <NutritionInfo label="Fat" value={`${Math.round(nutrition.fat)}g`} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Ingredients</h4>
          <ul className="text-sm space-y-1 ml-1">
            {meal.ingredients
              .slice(0, expanded ? meal.ingredients.length : 3)
              .map((ingredient, idx) => (
                <li
                  key={`${meal.id || idx}-ing-${idx}`}
                  className="flex items-start"
                >
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

        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save to My Meals"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface NutritionInfoProps {
  label: string;
  value: string;
}

function NutritionInfo({ label, value }: NutritionInfoProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-700">{value}</span>
    </div>
  );
}
