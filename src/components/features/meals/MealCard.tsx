"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PencilIcon, TrashIcon } from "lucide-react";
import { MealRating } from "./MealRating";
import { MealRatingSummary } from "@/lib/api-services";
import { MealImage } from "./MealImage";
import { Badge } from "@/components/ui/badge";

export interface Meal {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image_url?: string;
  image_status?: "pending" | "generating" | "completed" | "failed";
  imageUrl?: string; // For backward compatibility
  ratings?: MealRatingSummary;
}

export interface MealCardProps {
  meal: Meal;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
  variant?: "default" | "highlight";
  showActions?: boolean;
  showRating?: boolean;
  onRatingChange?: (id: string, ratings: MealRatingSummary) => void;
  fridgePercentage?: number;
}

export function MealCard({
  meal,
  onEdit,
  onDelete,
  onClick,
  className,
  variant = "default",
  showActions = true,
  showRating = true,
  onRatingChange,
  fridgePercentage,
}: MealCardProps) {
  const handleClick = () => {
    if (onClick) onClick(meal.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(meal.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(meal.id);
  };

  const handleRatingChange = (newRatings: MealRatingSummary) => {
    if (onRatingChange) {
      onRatingChange(meal.id, newRatings);
    }
  };

  // Get badge variant based on fridge percentage
  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return "success";
    if (percentage >= 50) return "secondary";
    return "default";
  };

  return (
    <Card
      variant={variant}
      className={cn("overflow-hidden", onClick && "cursor-pointer", className)}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex flex-col gap-4">
        <div className="h-40 w-full -mx-6 -mt-6 mb-2 relative">
          <MealImage
            imageUrl={meal.image_url || meal.imageUrl}
            status={meal.image_status || "completed"}
            name={meal.name}
            width={400}
            height={160}
            className="h-full w-full"
          />

          {typeof fridgePercentage === "number" && (
            <div className="absolute top-2 right-2">
              <Badge
                variant={getBadgeVariant(fridgePercentage)}
                className="text-xs font-medium"
              >
                {fridgePercentage}% in fridge
              </Badge>
            </div>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-neutral-800">
              {meal.name}
            </h3>
            {meal.description && (
              <p className="text-sm text-neutral-600 mt-1">
                {meal.description}
              </p>
            )}
          </div>
        </div>

        {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {meal.calories && (
              <NutritionInfo label="Calories" value={`${meal.calories} kcal`} />
            )}
            {meal.protein && (
              <NutritionInfo label="Protein" value={`${meal.protein}g`} />
            )}
            {meal.carbs && (
              <NutritionInfo label="Carbs" value={`${meal.carbs}g`} />
            )}
            {meal.fat && <NutritionInfo label="Fat" value={`${meal.fat}g`} />}
          </div>
        )}

        {showRating && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <MealRating
              mealId={meal.id}
              initialRatings={meal.ratings}
              variant="compact"
              onRatingChange={handleRatingChange}
            />
          </div>
        )}

        {showActions && (onEdit || onDelete) && (
          <div className="flex justify-end mt-2 space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                leftIcon={<PencilIcon className="w-4 h-4" />}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

interface NutritionInfoProps {
  label: string;
  value: string;
}

function NutritionInfo({ label, value }: NutritionInfoProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-700">{value}</span>
    </div>
  );
}
