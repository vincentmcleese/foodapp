import { PageLayout } from "@/components/common/PageLayout";
import { ClientPlanPage } from "@/components/features/plan/ClientPlanPage";
import { supabaseAdmin } from "@/lib/supabase";
import { PlanEntry } from "@/lib/api-services";

export const dynamic = "force-dynamic";

// Mock data for development when Supabase connection fails
const mockPlanEntries: PlanEntry[] = [
  {
    id: "mock-1",
    meal_id: "mock-meal-1",
    date: new Date().toISOString().split("T")[0],
    meal_type: "breakfast",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meal: {
      id: "mock-meal-1",
      name: "Mock Breakfast",
      description: "A sample breakfast for development",
      image_url: undefined,
      image_status: "completed",
      nutrition: { calories: 400, protein: 20, carbs: 40, fat: 15 },
    },
  },
  {
    id: "mock-2",
    meal_id: "mock-meal-2",
    date: new Date().toISOString().split("T")[0],
    meal_type: "lunch",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meal: {
      id: "mock-meal-2",
      name: "Mock Lunch",
      description: "A sample lunch for development",
      image_url: undefined,
      image_status: "completed",
      nutrition: { calories: 600, protein: 30, carbs: 60, fat: 20 },
    },
  },
];

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
        meal:meal_id (id, name, description, image_url, image_status, nutrition)
      `
      )
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching plan entries:", error);

      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Using mock plan entries for development in server component"
        );
        entries = mockPlanEntries;
      }
    } else {
      entries = data as PlanEntry[];
    }
  } catch (error) {
    console.error("Error fetching plan entries:", error);

    // Use mock data in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using mock plan entries for development in server component after exception"
      );
      entries = mockPlanEntries;
    }
  }

  return (
    <PageLayout
      title="Weekly Meal Plan"
      subtitle="Plan your meals for the week"
    >
      <ClientPlanPage initialEntries={entries} />
    </PageLayout>
  );
}
