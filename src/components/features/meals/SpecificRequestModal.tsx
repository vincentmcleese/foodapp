"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChefHat } from "lucide-react";

interface SpecificRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: string) => void;
  isLoading?: boolean;
}

export function SpecificRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: SpecificRequestModalProps) {
  const [request, setRequest] = useState("");

  const handleSubmit = () => {
    if (request.trim()) {
      onSubmit(request.trim());
    }
  };

  const placeholderExamples = [
    "I want something with lots of onion",
    "Quick breakfast ideas that are high in protein",
    "Vegetarian dinner that uses bell peppers",
    "Something Italian that can be prepared in under 20 minutes",
    "Kid-friendly meals that sneak in vegetables",
  ];

  const randomPlaceholder =
    placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />I Want Something Specific
          </DialogTitle>
          <DialogDescription>
            Tell us exactly what you're looking for and we'll generate
            personalized meal recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder={`Example: "${randomPlaceholder}"`}
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Be as specific as you want! Mention ingredients, cuisines, cooking
            methods, dietary preferences, or time constraints.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !request.trim()}
          >
            {isLoading ? "Generating..." : "Generate Recommendations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
