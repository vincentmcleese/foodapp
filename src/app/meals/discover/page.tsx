"use client";

import { useState, useEffect } from "react";
import { MealRecommendationList } from "@/components/features/meals/MealRecommendationList";
import { generateMealRecommendations } from "@/lib/ai-service";
import { PageLayout } from "@/components/common/PageLayout";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthPrinciple } from "@/lib/api-services";

// Enhanced loading component
function RecommendationsLoading() {
  return (
    <PageLayout
      title="Discover New Meals"
      subtitle="Generating personalized meal recommendations for you..."
    >
      <div className="flex justify-center items-center mb-8">
        <Spinner size="lg" className="text-primary mr-2" />
        <span className="text-primary font-medium">
          Loading recommendations
        </span>
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border rounded-lg p-4 shadow-sm">
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

// Client-side Discover Page with immediate loading state
export default function DiscoverPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHealthPrinciples, setActiveHealthPrinciples] = useState<
    HealthPrinciple[]
  >([]);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        console.log("Starting to fetch data for recommendations");
        setIsLoading(true);

        // First, fetch active health principles
        const healthResponse = await fetch("/api/health/principles");
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          const activePrinciples = healthData.filter(
            (principle: HealthPrinciple) => principle.enabled
          );
          setActiveHealthPrinciples(activePrinciples);
        }

        // Fetch data for recommendations via API endpoint
        const response = await fetch("/api/meals/recommendations");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch recommendations: ${response.status}`
          );
        }

        const data = await response.json();
        console.log(
          "Recommendations fetched:",
          data.recommendations?.length || 0
        );

        setRecommendations(data.recommendations || []);
        setError(null);
      } catch (err) {
        console.error("Error in fetchRecommendations:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return <RecommendationsLoading />;
  }

  if (error) {
    return (
      <PageLayout
        title="Error Loading Recommendations"
        subtitle="There was an error generating meal recommendations. Please try again later."
      >
        <p className="mt-2 text-gray-600">Error details: {error}</p>
      </PageLayout>
    );
  }

  return (
    <MealRecommendationList
      initialRecommendations={recommendations}
      activeHealthPrinciples={activeHealthPrinciples}
    />
  );
}
