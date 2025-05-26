"use client";

import { useState, useEffect } from "react";
import { MealRecommendationCard } from "./MealRecommendationCard";
import {
  MealRecommendation,
  mealService,
  RecommendationRequest,
  HealthPrinciple,
} from "@/lib/api-services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toaster, toast } from "sonner";

interface MealRecommendationListProps {
  initialRecommendations: MealRecommendation[];
  activeHealthPrinciples?: HealthPrinciple[];
}

export function MealRecommendationList({
  initialRecommendations,
  activeHealthPrinciples = [],
}: MealRecommendationListProps) {
  console.log(
    "MealRecommendationList rendered with",
    initialRecommendations.length,
    "recommendations"
  );

  const [recommendations, setRecommendations] = useState<MealRecommendation[]>(
    initialRecommendations || []
  );
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingMealIds, setSavingMealIds] = useState<Set<string>>(new Set());

  // Filter recommendations based on user selections
  const filteredRecommendations = recommendations.filter((meal) => {
    if (
      cuisineFilter &&
      !meal.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase())
    ) {
      return false;
    }
    if (maxPrepTime < 60 && meal.prepTime > maxPrepTime) {
      return false;
    }
    return true;
  });

  const loadMore = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const nextPage = page + 1;

      console.log("Loading more recommendations, page:", nextPage);
      const options: RecommendationRequest = {
        page: nextPage,
        pageSize: 3,
      };

      if (cuisineFilter) {
        options.cuisine = cuisineFilter;
      }

      if (maxPrepTime < 60) {
        options.maxPrepTime = maxPrepTime;
      }

      const newRecommendations = await mealService.getRecommendations(options);
      console.log("New recommendations loaded:", newRecommendations.length);

      if (newRecommendations.length === 0) {
        setHasMore(false);
      } else {
        setRecommendations((prev) => [...prev, ...newRecommendations]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more recommendations:", error);
      setLoadError("Failed to load more recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeal = async (meal: MealRecommendation) => {
    if (!meal.id) {
      console.error("Cannot save meal without ID");
      return;
    }

    try {
      // Mark this meal as saving
      setSavingMealIds((prev) => new Set(prev).add(meal.id!));

      console.log("Saving meal:", meal.name);

      // Extract health principle IDs from active principles
      const healthPrincipleIds = activeHealthPrinciples
        .filter((principle) => principle.enabled)
        .map((principle) => principle.id);

      console.log("Using health principles:", healthPrincipleIds);

      // Save the meal with health principles
      await mealService.saveMeal(meal, healthPrincipleIds);

      console.log("Meal saved successfully");
      toast.success(`${meal.name} saved to your meals`);
    } catch (error) {
      console.error("Error saving meal:", error);
      toast.error(`Failed to save ${meal.name}`);
    } finally {
      // Remove this meal from saving state
      setSavingMealIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(meal.id!);
        return newSet;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Discover New Meals</h1>
        <p className="text-gray-600 mb-8">
          Personalized meal recommendations based on your fridge ingredients,
          health principles, and meal ratings.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
          <div>
            <Label htmlFor="cuisine" className="mb-2 block text-sm font-medium">
              Cuisine
            </Label>
            <Input
              id="cuisine"
              placeholder="Filter by cuisine (e.g. Italian, Asian)"
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="prepTime"
              className="mb-2 block text-sm font-medium"
            >
              Maximum Preparation Time: {maxPrepTime} minutes
            </Label>
            <Slider
              id="prepTime"
              defaultValue={[60]}
              max={60}
              step={5}
              onValueChange={(value: number[]) => setMaxPrepTime(value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-600 mb-4">
        {filteredRecommendations.length}{" "}
        {filteredRecommendations.length === 1 ? "meal" : "meals"} found
      </p>

      {/* Recommendation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((meal) => (
          <MealRecommendationCard
            key={meal.id}
            meal={meal}
            onSave={handleSaveMeal}
            isSaving={meal.id ? savingMealIds.has(meal.id) : false}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <Button onClick={loadMore} disabled={isLoading} className="px-6 py-2">
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Error message */}
      {loadError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {loadError}
        </div>
      )}

      <Toaster />
    </div>
  );
}
