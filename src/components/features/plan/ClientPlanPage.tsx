"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlanEntry, planService } from "@/lib/api-services";
import { Card } from "@/components/common/Card";
import { PlanCalendar } from "./PlanCalendar";
import { toast } from "sonner";

interface ClientPlanPageProps {
  initialEntries: PlanEntry[];
}

export function ClientPlanPage({ initialEntries }: ClientPlanPageProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a function to refresh plan entries
  const refreshEntries = async () => {
    try {
      setIsLoading(true);
      const updatedEntries = await planService.getAllEntries();
      setEntries(updatedEntries);
    } catch (err) {
      console.error("Error refreshing plan entries:", err);
      setError("Failed to refresh entries. Please reload the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to refresh entries when component mounts
  useEffect(() => {
    refreshEntries();
  }, []);

  const handleAddEntry = (date: string, mealType: string) => {
    router.push(`/plan/new?date=${date}&type=${mealType}`);
  };

  const handleEditEntry = (entry: PlanEntry) => {
    router.push(`/plan/${entry.id}`);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await planService.deleteEntry(entryId);

      // Update the local state
      setEntries(entries.filter((entry) => entry.id !== entryId));

      // Show success toast notification
      toast.success("Meal removed from plan");
    } catch (err) {
      console.error("Error deleting plan entry:", err);
      setError("Failed to delete entry. Please try again.");
      toast.error("Failed to remove meal from plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card variant="outlined" className="p-4 border-error mb-4">
          <p className="text-error">{error}</p>
        </Card>
      )}

      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={refreshEntries}
          className="text-sm text-primary hover:underline flex items-center"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh Plans"}
        </button>
      </div>

      {/* The calendar view */}
      <PlanCalendar
        entries={entries}
        onAddEntry={handleAddEntry}
        onEditEntry={handleEditEntry}
        onDeleteEntry={handleDeleteEntry}
      />
    </div>
  );
}
