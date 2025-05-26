"use client";

import { useState, useEffect } from "react";
import { MealRecommendationList } from "@/components/features/meals/MealRecommendationList";
import { generateMealRecommendations } from "@/lib/ai-service";
import { PageLayout } from "@/components/common/PageLayout";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthPrinciple } from "@/lib/api-services";
import { SpecificRequestModal } from "@/components/features/meals/SpecificRequestModal";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingSpecific, setIsGeneratingSpecific] = useState(false);
  const [specificRequest, setSpecificRequest] = useState<string | null>(null);

  const fetchRecommendations = async (specific?: string) => {
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
      let url = "/api/meals/recommendations";

      // Add specific request parameter if provided
      if (specific) {
        url += `?specificRequest=${encodeURIComponent(specific)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
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
      setIsGeneratingSpecific(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleSpecificRequest = async (request: string) => {
    setIsModalOpen(false);
    setIsGeneratingSpecific(true);
    setSpecificRequest(request);
    await fetchRecommendations(request);
  };

  // Custom actions for the PageLayout
  const pageActions = (
    <Button
      onClick={() => setIsModalOpen(true)}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Sparkles className="h-4 w-4" />I want something specific
    </Button>
  );

  if (isLoading && !isGeneratingSpecific) {
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
    <>
      {isGeneratingSpecific ? (
        <PageLayout
          title="Generating Specific Recommendations"
          subtitle={`Creating meal ideas for: "${specificRequest}"`}
          actions={pageActions}
        >
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="text-primary mb-4" />
            <p className="text-lg font-medium text-primary">
              Generating personalized recommendations...
            </p>
            <p className="text-gray-500 mt-2">
              This may take a moment as we craft meals tailored to your request.
            </p>
          </div>
        </PageLayout>
      ) : (
        <MealRecommendationList
          initialRecommendations={recommendations}
          activeHealthPrinciples={activeHealthPrinciples}
          specificRequest={specificRequest}
          onRequestSpecific={() => setIsModalOpen(true)}
        />
      )}

      <SpecificRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSpecificRequest}
        isLoading={isGeneratingSpecific}
      />
    </>
  );
}
