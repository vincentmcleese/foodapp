"use client";

import { useState, useEffect } from "react";
import { MealRecommendationCard } from "./MealRecommendationCard";
import {
  MealRecommendation,
  mealService,
  RecommendationRequest,
  HealthPrinciple,
} from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { PageLayout } from "@/components/common/PageLayout";
import { Sparkles } from "lucide-react";

interface MealRecommendationListProps {
  initialRecommendations: MealRecommendation[];
  activeHealthPrinciples?: HealthPrinciple[];
  specificRequest?: string | null;
  onRequestSpecific?: () => void;
}

export function MealRecommendationList({
  initialRecommendations,
  activeHealthPrinciples = [],
  specificRequest,
  onRequestSpecific,
}: MealRecommendationListProps) {
  console.log(
    "MealRecommendationList rendered with",
    initialRecommendations.length,
    "recommendations"
  );

  const [recommendations, setRecommendations] = useState<MealRecommendation[]>(
    initialRecommendations || []
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingMealIds, setSavingMealIds] = useState<Set<string>>(new Set());

  const loadMore = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const nextPage = page + 1;

      console.log("Loading more recommendations, page:", nextPage);
      const options: RecommendationRequest = {
        page: nextPage,
        pageSize: 3,
        specificRequest: specificRequest || undefined,
      };

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

  // Customize page actions based on props
  const pageActions = onRequestSpecific ? (
    <Button
      onClick={onRequestSpecific}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Sparkles className="h-4 w-4" />I want something specific
    </Button>
  ) : null;

  // Customize subtitle based on whether there's a specific request
  const subtitle = specificRequest
    ? `Personalized meals for: "${specificRequest}"`
    : "Personalized meal recommendations based on your fridge ingredients, health principles, and meal ratings.";

  return (
    <PageLayout
      title="Discover New Meals"
      subtitle={subtitle}
      actions={pageActions}
    >
      {/* Results count */}
      <p className="text-gray-600 mb-4">
        {recommendations.length}{" "}
        {recommendations.length === 1 ? "meal" : "meals"} found
      </p>

      {/* Recommendation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((meal) => (
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
    </PageLayout>
  );
}
