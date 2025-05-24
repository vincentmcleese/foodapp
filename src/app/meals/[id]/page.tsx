import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { MealForm } from "@/components/features/meals/MealForm";
import { calculateNutrition } from "@/lib/meal";
import { PageLayout } from "@/components/common/PageLayout";

export const dynamic = "force-dynamic";

interface MealPageProps {
  params: {
    id: string;
  };
}

export default async function MealPage({ params }: MealPageProps) {
  const { id } = params;

  // Fetch the meal with its ingredients
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

  // Process the meal data
  const ingredients = meal.meal_ingredient || [];
  const nutrition = calculateNutrition(ingredients);

  const processedMeal = {
    ...meal,
    ingredients,
    nutrition,
  };

  return (
    <PageLayout title="Edit Meal" subtitle="Make changes to your meal">
      <MealForm meal={processedMeal} isEditing={true} />
    </PageLayout>
  );
}
