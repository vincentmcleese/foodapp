"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { HealthPrinciple, healthService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface HealthPrincipleCardProps {
  principle: HealthPrinciple;
  onToggle: (principle: HealthPrinciple) => void;
  onDelete: (id: string) => void;
}

export function HealthPrincipleCard({
  principle,
  onToggle,
  onDelete,
}: HealthPrincipleCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const updatedPrinciple = await healthService.togglePrinciple(
        principle.id,
        !principle.enabled
      );
      onToggle(updatedPrinciple);
      toast.success(
        `${principle.name} ${updatedPrinciple.enabled ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Error toggling principle:", error);
      toast.error("Failed to toggle principle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await healthService.deletePrinciple(principle.id);
      onDelete(principle.id);
      toast.success(`${principle.name} deleted`);
    } catch (error) {
      console.error("Error deleting principle:", error);
      toast.error("Failed to delete principle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{principle.name}</h3>
          {principle.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {principle.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={principle.enabled}
              onCheckedChange={handleToggle}
              disabled={isLoading}
              aria-label={`Toggle ${principle.name}`}
            />
            <span className="text-sm text-muted-foreground">
              {principle.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isLoading}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label={`Delete ${principle.name}`}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
