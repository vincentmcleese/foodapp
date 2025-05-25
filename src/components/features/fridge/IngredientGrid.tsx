"use client";

import { useState } from "react";
import { Ingredient, FridgeItem } from "@/lib/api-services";
import { IngredientImage } from "./IngredientImage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IngredientGridProps {
  ingredients: Ingredient[];
  fridgeItems: FridgeItem[];
  onEdit?: (ingredient: Ingredient) => void;
  onDelete?: (ingredientId: string) => void;
  className?: string;
}

export function IngredientGrid({
  ingredients,
  fridgeItems,
  onEdit,
  onDelete,
  className,
}: IngredientGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Ensure ingredients is always an array
  const ingredientsArray = Array.isArray(ingredients) ? ingredients : [];

  // Handle empty or undefined ingredients array
  if (!ingredientsArray.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          No ingredients found in your fridge
        </p>
      </div>
    );
  }

  // First, separate pantry items and regular ingredients
  const pantryItems = ingredientsArray.filter(
    (ing) => ing.ingredient_type === "pantry"
  );
  const regularIngredients = ingredientsArray.filter(
    (ing) => ing.ingredient_type === "regular"
  );

  // For each ingredient, find the corresponding fridge item if it exists
  const getFridgeItem = (ingredientId: string) => {
    return fridgeItems.find((item) => item.ingredient_id === ingredientId);
  };

  // Group regular ingredients by image status
  const completedIngredients = regularIngredients.filter(
    (ing) => ing.image_status === "completed"
  );
  const pendingIngredients = regularIngredients.filter(
    (ing) => ing.image_status === "pending" || ing.image_status === "generating"
  );
  const otherIngredients = regularIngredients.filter(
    (ing) =>
      ing.image_status !== "completed" &&
      ing.image_status !== "pending" &&
      ing.image_status !== "generating"
  );

  // Combine in order: completed first, then pending, then others
  const sortedRegularIngredients = [
    ...completedIngredients,
    ...pendingIngredients,
    ...otherIngredients,
  ];

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      // If already in confirm state, delete it
      onDelete?.(id);
      setDeleteConfirmId(null);
    } else {
      // Otherwise, set to confirm state
      setDeleteConfirmId(id);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-8">
      {/* First section: Pantry Items */}
      {pantryItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pantry Items</h2>
          <div
            className={cn(
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
              className
            )}
          >
            {pantryItems.map((ingredient) => {
              const fridgeItem = getFridgeItem(ingredient.id);
              const status = fridgeItem?.status || "NOT_IN_STOCK";

              return (
                <Card
                  key={ingredient.id}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
                    hoveredId === ingredient.id ? "ring-2 ring-primary" : "",
                    status === "IN_STOCK"
                      ? "border-green-500"
                      : "border-red-500"
                  )}
                  onMouseEnter={() => setHoveredId(ingredient.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center">
                      <IngredientImage
                        imageUrl={ingredient.image_url}
                        name={ingredient.name}
                        status={ingredient.image_status}
                        className="mb-2 mx-auto"
                        width={100}
                        height={100}
                      />
                      <h3 className="text-sm font-medium text-center line-clamp-2 min-h-[2.5rem]">
                        {ingredient.name}
                      </h3>
                      <Badge
                        variant={
                          status === "IN_STOCK" ? "success" : "destructive"
                        }
                        className="mt-2"
                      >
                        {status === "IN_STOCK" ? "In Stock" : "Not In Stock"}
                      </Badge>
                    </div>

                    {/* Action buttons that appear on hover */}
                    {(onEdit || onDelete) && (
                      <div
                        className={cn(
                          "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
                          hoveredId === ingredient.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      >
                        <TooltipProvider>
                          {deleteConfirmId === ingredient.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                aria-label="Confirm deletion"
                                onClick={() => onDelete?.(ingredient.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label="Cancel deletion"
                                onClick={handleCancelDelete}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              {onEdit && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                                      onClick={() => onEdit(ingredient)}
                                      aria-label={`Edit ${ingredient.name}`}
                                    >
                                      <PencilIcon className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {onDelete && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                                      onClick={() =>
                                        handleDeleteClick(ingredient.id)
                                      }
                                      aria-label={`Delete ${ingredient.name}`}
                                    >
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </TooltipProvider>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Second section: Regular Ingredients */}
      {sortedRegularIngredients.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <div
            className={cn(
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
              className
            )}
          >
            {sortedRegularIngredients.map((ingredient) => {
              const fridgeItem = getFridgeItem(ingredient.id);
              return (
                <Card
                  key={ingredient.id}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
                    hoveredId === ingredient.id ? "ring-2 ring-primary" : ""
                  )}
                  onMouseEnter={() => setHoveredId(ingredient.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center">
                      <IngredientImage
                        imageUrl={ingredient.image_url}
                        name={ingredient.name}
                        status={ingredient.image_status}
                        className="mb-2 mx-auto"
                        width={100}
                        height={100}
                      />
                      <h3 className="text-sm font-medium text-center line-clamp-2 min-h-[2.5rem]">
                        {ingredient.name}
                      </h3>
                      {fridgeItem && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {fridgeItem.quantity} {fridgeItem.unit}
                        </p>
                      )}
                    </div>

                    {/* Action buttons that appear on hover */}
                    {(onEdit || onDelete) && (
                      <div
                        className={cn(
                          "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
                          hoveredId === ingredient.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      >
                        <TooltipProvider>
                          {deleteConfirmId === ingredient.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                aria-label="Confirm deletion"
                                onClick={() => onDelete?.(ingredient.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label="Cancel deletion"
                                onClick={handleCancelDelete}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              {onEdit && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                                      onClick={() => onEdit(ingredient)}
                                      aria-label={`Edit ${ingredient.name}`}
                                    >
                                      <PencilIcon className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {onDelete && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                                      onClick={() =>
                                        handleDeleteClick(ingredient.id)
                                      }
                                      aria-label={`Delete ${ingredient.name}`}
                                    >
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </TooltipProvider>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
