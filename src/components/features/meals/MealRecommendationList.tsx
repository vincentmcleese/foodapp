"use client";

import { useState, useEffect } from "react";
import { MealRecommendationCard } from "./MealRecommendationCard";
import {
  MealRecommendation,
  mealService,
  RecommendationRequest,
} from "@/lib/api-services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/toaster";

interface MealRecommendationListProps {
  initialRecommendations: MealRecommendation[];
}

export function MealRecommendationList({
  initialRecommendations,
}: MealRecommendationListProps) {
  console.log(
    "MealRecommendationList rendered with initial recommendations:",
    initialRecommendations?.length || 0
  );

  const [recommendations, setRecommendations] = useState<MealRecommendation[]>(
    initialRecommendations
  );
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    MealRecommendation[]
  >(initialRecommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState<number>(60);

  // Apply filters when they change
  useEffect(() => {
    console.log("Applying filters:", { cuisineFilter, maxPrepTime });
    let filtered = recommendations;

    if (cuisineFilter) {
      filtered = filtered.filter((meal) =>
        meal.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase())
      );
    }

    if (maxPrepTime < 60) {
      filtered = filtered.filter(
        (meal) => meal.prepTime + meal.cookTime <= maxPrepTime
      );
    }

    console.log("Filtered recommendations:", filtered.length);
    setFilteredRecommendations(filtered);
  }, [recommendations, cuisineFilter, maxPrepTime]);

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
    console.log("Saving meal:", meal.name);
    try {
      await mealService.saveMeal(meal);
      console.log("Meal saved successfully");
    } catch (error) {
      console.error("Error saving meal:", error);
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
          />
        ))}
      </div>

      {/* Load more button */}
      {filteredRecommendations.length > 0 && hasMore && (
        <div className="mt-8 text-center">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
            className="px-6 py-2"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
          {loadError && (
            <p className="text-red-500 mt-2 text-sm">{loadError}</p>
          )}
        </div>
      )}

      {/* No results */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No meals match your current filters.
          </p>
          <Button
            onClick={() => {
              setCuisineFilter("");
              setMaxPrepTime(60);
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
}
