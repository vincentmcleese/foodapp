import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PageLayout } from "@/components/common/PageLayout";
import { PlanEntryForm } from "@/components/features/plan/PlanEntryForm";

export const dynamic = "force-dynamic";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlanPage({ params }: PlanPageProps) {
  // Await params to access id safely
  const { id } = await params;

  // Fetch the plan entry
  const { data: entry, error } = await supabaseAdmin
    .from("meal_plan")
    .select(
      `
      *,
      meal:meal_id (id, name, description, image_url, nutrition)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching plan entry:", error);
    notFound();
  }

  return (
    <PageLayout title="Edit Plan Entry" subtitle="Update your meal plan">
      <PlanEntryForm entry={entry} isEditing={true} />
    </PageLayout>
  );
}
