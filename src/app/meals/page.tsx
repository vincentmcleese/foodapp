"use client";

import { useEffect, useState } from "react";
import {
  Meal,
  MealIngredient,
  fridgeService,
  RecommendationRequest,
} from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/common/PageLayout";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/common/Card";
import { MealCardLink } from "@/components/features/meals/MealCardLink";
import { DiscoverButton } from "@/components/features/meals/DiscoverButton";
import { MealFilter } from "@/components/features/meals/MealFilter";
import { applyMealFilters } from "@/lib/meal";
import { Spinner } from "@/components/ui/spinner";

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationRequest>({});
  const [fridgeItems, setFridgeItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch fridge items for percentage calculation
        const fridgeData = await fridgeService.getAllItems();
        setFridgeItems(fridgeData);

        // Fetch meals
        const mealsResponse = await fetch("/api/meals");
        if (!mealsResponse.ok) {
          throw new Error("Failed to fetch meals");
        }

        const mealsData = await mealsResponse.json();
        setMeals(mealsData);
        setError(null);
      } catch (error) {
        console.error("Error fetching meals:", error);
        setError("Failed to load meals. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting
  const filteredMeals = applyMealFilters(meals, filters, fridgeItems);

  // Create the page actions with both Discover and Add New Meal buttons
  const PageActions = (
    <div className="flex gap-2">
      <DiscoverButton />
      <Link href="/meals/new">
        <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
          Add New Meal
        </Button>
      </Link>
    </div>
  );

  return (
    <PageLayout
      title="Meals"
      subtitle="Browse and manage your meals"
      actions={PageActions}
    >
      <MealFilter onFilterChange={setFilters} className="mb-6" />

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card variant="outlined" className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
        </Card>
      ) : filteredMeals.length === 0 ? (
        <Card variant="outlined" className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No meals found</h3>
          {meals.length === 0 ? (
            <>
              <p className="text-gray-500 mb-4">
                You haven't added any meals yet.
              </p>
              <Link href="/meals/new">
                <Button>Add Your First Meal</Button>
              </Link>
            </>
          ) : (
            <p className="text-gray-500 mb-4">
              Try adjusting your filters to see more meals.
            </p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMeals.map((meal) => (
            <MealCardLink
              key={meal.id}
              href={`/meals/${meal.id}`}
              meal={{
                id: meal.id,
                name: meal.name,
                description: meal.description,
                calories: meal.nutrition?.calories,
                protein: meal.nutrition?.protein,
                carbs: meal.nutrition?.carbs,
                fat: meal.nutrition?.fat,
                image_url: meal.image_url,
                image_status: meal.image_status,
              }}
              mealIngredients={meal.meal_ingredient}
              variant="default"
              showActions={false}
              className="h-full"
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
