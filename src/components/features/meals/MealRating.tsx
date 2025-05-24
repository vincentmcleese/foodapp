"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealRatingSummary, mealService } from "@/lib/api-services";
import { toast } from "sonner";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@/hooks/useWindowSize";

interface MealRatingProps {
  mealId: string;
  initialRatings?: MealRatingSummary;
  onRatingChange?: (newRating: MealRatingSummary) => void;
  variant?: "compact" | "full";
}

export function MealRating({
  mealId,
  initialRatings,
  onRatingChange,
  variant = "full",
}: MealRatingProps) {
  const [ratings, setRatings] = useState<MealRatingSummary>(
    initialRatings || { likes: 0, dislikes: 0, total: 0 }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Handle the confetti animation for like
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleRating = async (isLike: boolean) => {
    try {
      setIsSubmitting(true);

      // Submit the rating to the API
      await mealService.rateMeal(mealId, isLike);

      // Update the local rating count
      const newRatings = {
        likes: isLike ? ratings.likes + 1 : ratings.likes,
        dislikes: isLike ? ratings.dislikes : ratings.dislikes + 1,
        total: ratings.total + 1,
        userRating: isLike,
      };

      setRatings(newRatings);

      // Show confetti for likes
      if (isLike) {
        triggerConfetti();
      }

      // Notify the parent component
      if (onRatingChange) {
        onRatingChange(newRatings);
      }

      // Show success message
      toast.success(
        isLike ? "Thanks for liking this meal!" : "Thanks for your feedback!"
      );
    } catch (error) {
      console.error("Error rating meal:", error);
      toast.error("Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        {showConfetti && (
          <ReactConfetti
            width={width}
            height={height}
            numberOfPieces={200}
            recycle={false}
          />
        )}
        <Badge variant="outline" className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          {ratings.likes}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <ThumbsDown className="w-3 h-3" />
          {ratings.dislikes}
        </Badge>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => handleRating(true)}
            disabled={isSubmitting}
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => handleRating(false)}
            disabled={isSubmitting}
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      <div className="mb-3">
        <h3 className="text-base font-medium mb-1">Rate this meal</h3>
        <p className="text-sm text-muted-foreground">
          Your feedback helps improve our meal recommendations
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleRating(true)}
            disabled={isSubmitting}
          >
            <ThumbsUp className="w-4 h-4" />
            Like ({ratings.likes})
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleRating(false)}
            disabled={isSubmitting}
          >
            <ThumbsDown className="w-4 h-4" />
            Dislike ({ratings.dislikes})
          </Button>
        </div>

        {ratings.total > 0 && (
          <p className="text-sm text-muted-foreground">
            {ratings.total} {ratings.total === 1 ? "rating" : "ratings"}
          </p>
        )}
      </div>
    </Card>
  );
}
