import Link from "next/link";
import { PageLayout } from "@/components/common/PageLayout";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/common/Card";
import { ClientPlanPage } from "@/components/features/plan/ClientPlanPage";
import { supabaseAdmin } from "@/lib/supabase";
import { PlanEntry } from "@/lib/api-services";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  // Fetch plan entries directly from Supabase
  let entries: PlanEntry[] = [];

  try {
    // Fetch directly from Supabase in server component
    const { data, error } = await supabaseAdmin
      .from("meal_plan")
      .select(
        `
        *,
        meal:meal_id (id, name, description, image_url, nutrition)
      `
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching plan entries:", error);
    } else {
      entries = data as PlanEntry[];
    }
  } catch (error) {
    console.error("Error fetching plan entries:", error);
  }

  // Create the "Add New Entry" button for the page actions
  const AddEntryButton = (
    <Link href="/plan/new">
      <Button leftIcon={<PlusIcon className="w-4 h-4" />}>Add to Plan</Button>
    </Link>
  );

  return (
    <PageLayout
      title="Weekly Meal Plan"
      subtitle="Plan your meals for the week"
      actions={AddEntryButton}
    >
      <Card className="p-4 mb-4">
        <p className="text-neutral-600">
          Use the calendar below to plan your meals for the week. Click on any
          empty slot to add a meal.
        </p>
      </Card>
      <ClientPlanPage initialEntries={entries} />
    </PageLayout>
  );
}
