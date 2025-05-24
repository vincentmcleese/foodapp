import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import MealForm from "@/components/MealForm";
import { calculateNutrition } from "@/lib/meal";

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
      meal_ingredient:meal_id (
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Meal</h1>
      <MealForm meal={processedMeal} isEditing={true} />
    </div>
  );
}
