import { Suspense } from "react";
import { ClientHealthPage } from "@/components/features/health/ClientHealthPage";
import { supabaseAdmin } from "@/lib/supabase";
import { HealthPrinciple } from "@/lib/api-services";

// Fetch health principles from the server
async function getHealthPrinciples(): Promise<HealthPrinciple[]> {
  const { data, error } = await supabaseAdmin
    .from("health_principle")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching health principles:", error);
    return [];
  }

  return data || [];
}

export default async function HealthPage() {
  const principles = await getHealthPrinciples();

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Health Principles</h1>
      <p className="text-muted-foreground mb-8">
        Science-based principles to guide your meal planning and dietary
        choices.
      </p>

      <Suspense fallback={<div>Loading principles...</div>}>
        <ClientHealthPage initialPrinciples={principles} />
      </Suspense>
    </div>
  );
}
