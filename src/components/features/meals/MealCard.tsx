"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PencilIcon, TrashIcon } from "lucide-react";

export interface Meal {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl?: string;
}

export interface MealCardProps {
  meal: Meal;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
  variant?: "default" | "highlight";
  showActions?: boolean;
}

export function MealCard({
  meal,
  onEdit,
  onDelete,
  onClick,
  className,
  variant = "default",
  showActions = true,
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

  return (
    <Card
      variant={variant}
      className={cn("overflow-hidden", onClick && "cursor-pointer", className)}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex flex-col gap-4">
        {meal.imageUrl && (
          <div className="h-40 w-full -mx-6 -mt-6 mb-2">
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

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

function NutritionInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-2 text-center">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
