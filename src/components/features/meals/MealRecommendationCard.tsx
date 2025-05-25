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
  SaveIcon,
  ClockIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { MealRecommendation } from "@/lib/api-services";
import { useToast } from "@/hooks/use-toast";
import { MealImage } from "./MealImage";

interface MealRecommendationCardProps {
  meal: MealRecommendation;
  onSave: (meal: MealRecommendation) => Promise<void>;
}

export function MealRecommendationCard({
  meal,
  onSave,
}: MealRecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(meal);
      toast({
        title: "Meal saved successfully!",
        description: `${meal.name} has been added to your meals.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to save meal",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex space-x-2 text-xs">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {meal.nutrition.calories} kcal
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {meal.nutrition.protein}g protein
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {meal.nutrition.carbs}g carbs
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {meal.nutrition.fat}g fat
            </Badge>
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
                <ChevronDownIcon className="w-3 h-3 mr-1" />
                Show {meal.ingredients.length - 3} more ingredients
              </li>
            )}
            {expanded && (
              <li
                className="text-indigo-600 cursor-pointer flex items-center text-xs"
                onClick={() => setExpanded(false)}
              >
                <ChevronUpIcon className="w-3 h-3 mr-1" />
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
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <SaveIcon className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save to My Meals"}
        </Button>
      </CardFooter>
    </Card>
  );
}
