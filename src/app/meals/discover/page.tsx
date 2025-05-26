"use client";

import { useState, useEffect } from "react";
import { MealRecommendationList } from "@/components/features/meals/MealRecommendationList";
import { supabaseAdmin } from "@/lib/supabase";
import { generateMealRecommendations } from "@/lib/ai-service";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/common/PageLayout";
import { Spinner } from "@/components/ui/spinner";
import { HealthPrinciple } from "@/lib/api-services";

// Enhanced loading component
function RecommendationsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover New Meals</h1>
        <p className="text-gray-600 mb-8">
          Generating personalized meal recommendations for you...
        </p>

        <div className="flex justify-center items-center mb-8">
          <Spinner size="lg" className="text-primary mr-2" />
          <span className="text-primary font-medium">
            Loading recommendations
          </span>
        </div>

        {/* Filters skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-4 shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">
          Error Loading Recommendations
        </h1>
        <p className="mt-4">
          There was an error generating meal recommendations. Please try again
          later.
        </p>
        <p className="mt-2 text-gray-600">Error details: {error}</p>
      </div>
    );
  }

  return (
    <MealRecommendationList
      initialRecommendations={recommendations}
      activeHealthPrinciples={activeHealthPrinciples}
    />
  );
}
