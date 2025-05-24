"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PencilIcon, TrashIcon } from "lucide-react";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: string;
  imageUrl?: string;
}

export interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
  variant?: "default" | "highlight" | "compact";
  showActions?: boolean;
}

export function IngredientCard({
  ingredient,
  onEdit,
  onDelete,
  onClick,
  className,
  variant = "default",
  showActions = true,
}: IngredientCardProps) {
  const handleClick = () => {
    if (onClick) onClick(ingredient.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(ingredient.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(ingredient.id);
  };

  // Format expiry date if present
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Determine if ingredient is expired
  const isExpired = () => {
    if (!ingredient.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(ingredient.expiryDate);
    return expiryDate < today;
  };

  const expired = isExpired();

  return (
    <Card
      variant={variant}
      className={cn(
        "overflow-hidden",
        onClick && "cursor-pointer",
        expired && "border-error border-2",
        className
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex items-start gap-4">
        {ingredient.imageUrl && variant !== "compact" && (
          <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0">
            <img
              src={ingredient.imageUrl}
              alt={ingredient.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-neutral-800">
                {ingredient.name}
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {ingredient.quantity} {ingredient.unit}
                {ingredient.category && ` • ${ingredient.category}`}
              </p>

              {ingredient.expiryDate && (
                <p
                  className={cn(
                    "text-xs mt-1",
                    expired ? "text-error" : "text-neutral-500"
                  )}
                >
                  {expired ? "Expired" : "Expires"}:{" "}
                  {formatDate(ingredient.expiryDate)}
                </p>
              )}
            </div>
          </div>

          {showActions && (onEdit || onDelete) && (
            <div className="flex justify-end mt-2 space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  leftIcon={<PencilIcon className="w-4 h-4" />}
                >
                  {variant !== "compact" && "Edit"}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant={variant === "compact" ? "ghost" : "destructive"}
                  size="sm"
                  onClick={handleDelete}
                  leftIcon={<TrashIcon className="w-4 h-4" />}
                >
                  {variant !== "compact" && "Delete"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
