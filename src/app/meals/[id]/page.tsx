import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PageLayout } from "@/components/common/PageLayout";
import { MealForm } from "@/components/features/meals/MealForm";

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

  return (
    <PageLayout title="Edit Meal" subtitle="Update your meal">
      <MealForm meal={meal} isEditing={true} />
    </PageLayout>
  );
}
