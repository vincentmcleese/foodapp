import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PageLayout } from "@/components/common/PageLayout";
import { ClientMealPage } from "@/components/features/meals/ClientMealPage";
import { calculateNutrition } from "@/lib/meal";

export const dynamic = "force-dynamic";

interface MealPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPage({ params }: MealPageProps) {
  // Await params to access id safely
  const { id } = await params;

  // Fetch the meal
  const { data: meal, error } = await supabaseAdmin
    .from("meal")
    .select(
      `
      *,
      meal_ingredient!meal_id (
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching meal:", error);
    notFound();
  }

  // Get ratings for this meal
  const { data: ratings, error: ratingsError } = await supabaseAdmin
    .from("meal_rating")
    .select("*")
    .eq("meal_id", id);

  if (ratingsError) {
    console.error("Error fetching meal ratings:", ratingsError);
    // Continue without ratings rather than failing
  }

  // Calculate rating summary
  const mealRatings = ratings || [];
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

  // Calculate nutrition
  const nutrition = calculateNutrition(meal.meal_ingredient || []);

  // Prepare the complete meal object
  const completeMeal = {
    ...meal,
    ingredients: meal.meal_ingredient || [],
    nutrition,
    ratings: ratingSummary,
  };

  return (
    <PageLayout title={meal.name} subtitle="Meal Details">
      <ClientMealPage meal={completeMeal} />
    </PageLayout>
  );
}
