import { Meal, mealService } from "@/lib/api-services";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/common/PageLayout";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/common/Card";
import { MealCardLink } from "@/components/features/meals/MealCardLink";
import { DiscoverButton } from "@/components/features/meals/DiscoverButton";

export const dynamic = "force-dynamic";

interface MealIngredient {
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient: {
    id: string;
    name: string;
    ingredient_type?: string;
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
          name,
          ingredient_type
        )
      )
    `);

  if (error) {
    console.error("Error fetching meals:", error);
    return <div>Error loading meals</div>;
  }

  // Fetch ratings for all meals
  const { data: allRatings, error: ratingsError } = await supabaseAdmin
    .from("meal_rating")
    .select("*");

  if (ratingsError) {
    console.error("Error fetching meal ratings:", ratingsError);
  }

  // Process the meals data for display
  const processedMeals = meals.map((meal) => {
    // Calculate total calories if nutrition data exists
    const totalCalories = meal.nutrition?.calories || 0;

    // Get ingredient names
    const ingredients =
      meal.meal_ingredient?.map((mi: MealIngredient) => mi.ingredient.name) ||
      [];

    // Calculate rating summary for this meal
    const mealRatings = allRatings
      ? allRatings.filter((rating: any) => rating.meal_id === meal.id)
      : [];

    const likes = mealRatings.filter(
      (r: { rating: boolean }) => r.rating === true
    ).length;

    const dislikes = mealRatings.filter(
      (r: { rating: boolean }) => r.rating === false
    ).length;

    const ratingSummary = {
      likes,
      dislikes,
      total: mealRatings.length,
    };

    return {
      ...meal,
      totalCalories,
      ingredients,
      ratings: ratingSummary,
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
                ratings: meal.ratings,
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
