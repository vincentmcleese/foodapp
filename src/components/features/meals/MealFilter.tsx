"use client";

import { useState, useEffect } from "react";
import { HealthPrinciple, RecommendationRequest } from "@/lib/api-services";
import { healthService } from "@/lib/api-services";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FilterIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealFilterProps {
  onFilterChange: (filters: RecommendationRequest) => void;
  className?: string;
  defaultFilters?: RecommendationRequest;
}

export function MealFilter({
  onFilterChange,
  className,
  defaultFilters = {},
}: MealFilterProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [healthPrinciples, setHealthPrinciples] = useState<HealthPrinciple[]>(
    []
  );
  const [selectedPrinciples, setSelectedPrinciples] = useState<string[]>(
    defaultFilters.healthPrinciples || []
  );
  const [sortBy, setSortBy] = useState<string>(defaultFilters.sortBy || "name");

  // Fetch health principles on component mount
  useEffect(() => {
    const fetchHealthPrinciples = async () => {
      try {
        setIsLoading(true);
        const principles = await healthService.getAllPrinciples();
        // Only show enabled principles
        setHealthPrinciples(principles.filter((p) => p.enabled));
      } catch (error) {
        console.error("Error fetching health principles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthPrinciples();
  }, []);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange({
      healthPrinciples: selectedPrinciples,
      sortBy: sortBy as "fridgePercentage" | "name" | "created",
    });
  }, [selectedPrinciples, sortBy, onFilterChange]);

  // Handle health principle selection
  const togglePrinciple = (principleId: string) => {
    setSelectedPrinciples((prev) => {
      if (prev.includes(principleId)) {
        return prev.filter((id) => id !== principleId);
      } else {
        return [...prev, principleId];
      }
    });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1"
        >
          <FilterIcon className="h-4 w-4" />
          Filter & Sort
          {selectedPrinciples.length > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
              {selectedPrinciples.length}
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <Card className={cn("p-4 mb-4", className)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Health principles filter */}
            <div>
              <h3 className="text-sm font-medium mb-2">Health Principles</h3>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              ) : healthPrinciples.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No health principles found
                </p>
              ) : (
                <div className="space-y-2">
                  {healthPrinciples.map((principle) => (
                    <div
                      key={principle.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`principle-${principle.id}`}
                        checked={selectedPrinciples.includes(principle.id)}
                        onCheckedChange={() => togglePrinciple(principle.id)}
                      />
                      <Label
                        htmlFor={`principle-${principle.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {principle.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort options */}
            <div>
              <h3 className="text-sm font-medium mb-2">Sort By</h3>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fridgePercentage">
                    Fridge Percentage (Highest First)
                  </SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="created">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
