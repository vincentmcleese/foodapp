import { Meal, mealService } from "@/lib/api-services";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/common/PageLayout";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/common/Card";
import { DiscoverButton } from "@/components/features/meals/DiscoverButton";

export const dynamic = "force-dynamic";

interface MealIngredient {
  ingredient: {
    id: string;
    name: string;
  };
}

export default async function MealsPage() {
  // Fetch all meals from the API
  const { data: meals, error } = await supabaseAdmin.from("meal").select(`
      *,
      meal_ingredient!meal_id (
        *,
        ingredient (
          id,
          name
        )
      )
    `);

  if (error) {
    console.error("Error fetching meals:", error);
    return <div>Error loading meals</div>;
  }

  // Process the meals data for display
  const processedMeals = meals.map((meal) => {
    // Calculate total calories if nutrition data exists
    const totalCalories = meal.nutrition?.calories || 0;

    // Get ingredient names
    const ingredients =
      meal.meal_ingredient?.map((mi: MealIngredient) => mi.ingredient.name) ||
      [];

    return {
      ...meal,
      totalCalories,
      ingredients,
    };
  });

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
      {processedMeals.length === 0 ? (
        <Card variant="outlined" className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No meals found</h3>
          <p className="text-gray-500 mb-4">You haven't added any meals yet.</p>
          <Link href="/meals/new">
            <Button>Add Your First Meal</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedMeals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{meal.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {meal.description || "No description available"}
                  </p>
                  {meal.totalCalories > 0 && (
                    <p className="text-sm font-medium">
                      {meal.totalCalories} calories
                    </p>
                  )}
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      {meal.ingredients.slice(0, 3).join(", ")}
                      {meal.ingredients.length > 3 &&
                        `, +${meal.ingredients.length - 3} more`}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
