"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { MealImage } from "../meals/MealImage";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlanEntry, fridgeService } from "@/lib/api-services";
import { calculateFridgePercentage } from "@/lib/meal";
import { Badge } from "@/components/ui/badge";
import { MealSelectorModal } from "./MealSelectorModal";
import { toast } from "sonner";

// Define the days of the week
const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Define meal types
const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

interface PlanCalendarProps {
  entries: PlanEntry[];
  onAddEntry: (dayOfWeek: string, mealType: string) => void;
  onEditEntry: (entry: PlanEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function PlanCalendar({
  entries,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}: PlanCalendarProps) {
  // Add week offset state
  const [weekOffset, setWeekOffset] = useState(0);

  // State for MealSelectorModal
  const [isMealSelectorOpen, setIsMealSelectorOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<PlanEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the week's dates with the offset - define this function before using it
  const getWeekDates = (offset = 0) => {
    // Start with Monday as the first day of the week
    const monday = startOfWeek(addWeeks(new Date(), offset), {
      weekStartsOn: 1,
    });

    // Create a record with each day of the week and its date
    return days.reduce((acc, day, index) => {
      acc[day] = addDays(monday, index);
      return acc;
    }, {} as Record<string, Date>);
  };

  // Track the current week dates - initialize with default values
  const [weekDates, setWeekDates] = useState<Record<string, Date>>(() =>
    getWeekDates(weekOffset)
  );

  // Get week range display text
  const getWeekRangeText = () => {
    const startDate = weekDates["monday"];
    const endDate = weekDates["sunday"];
    if (!startDate || !endDate) return "";
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  // Update week dates when offset changes
  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset));
  }, [weekOffset]);

  // Format a date string to get day of week (lowercase)
  const getDayOfWeek = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      // Use toLocaleLowerCase to ensure consistency with our day keys
      return format(date, "EEEE").toLowerCase();
    } catch (error) {
      console.error("Invalid date string:", dateStr);
      return "monday"; // Default to Monday if there's an error
    }
  };

  // Handle clicking on an empty day slot
  const handleDayClick = (day: string, mealType: string) => {
    // Check if weekDates[day] exists before formatting the date
    if (!weekDates[day]) return;

    // Format the date for the API (YYYY-MM-DD)
    const formattedDate = format(weekDates[day], "yyyy-MM-dd");

    // Save the selected day and meal type
    setSelectedDay(formattedDate);
    setSelectedMealType(mealType);
    setEditingEntry(null); // Not editing an existing entry

    // Open the meal selector modal
    setIsMealSelectorOpen(true);
  };

  // Handle clicking edit on an existing entry
  const handleEditClick = (entry: PlanEntry) => {
    setEditingEntry(entry);
    setSelectedDay(entry.date);
    setSelectedMealType(entry.meal_type);
    setIsMealSelectorOpen(true);
  };

  // Handle meal selection from the modal
  const handleSelectMeal = async (mealId: string) => {
    if (editingEntry) {
      // Update existing entry
      await updatePlanEntry(editingEntry.id, mealId);
    } else if (selectedDay && selectedMealType) {
      // Create a new plan entry
      await createPlanEntry(selectedDay, selectedMealType, mealId);
    }
  };

  // Create a plan entry with the selected meal
  const createPlanEntry = async (
    date: string,
    mealType: string,
    mealId: string
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_id: mealId,
          date: date,
          meal_type: mealType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create plan entry");
      }

      toast.success("Meal added to plan");

      // Refresh the entries after successful creation
      onAddEntry(date, mealType);
    } catch (error) {
      console.error("Error creating plan entry:", error);
      toast.error("Failed to add meal to plan");
    } finally {
      setIsLoading(false);
    }
  };

  // Update a plan entry with a new meal
  const updatePlanEntry = async (entryId: string, mealId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/plan/${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_id: mealId,
          date: selectedDay,
          meal_type: selectedMealType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update plan entry");
      }

      toast.success("Meal updated successfully");

      // Refresh the entries after successful update
      onEditEntry({ id: entryId } as PlanEntry);
    } catch (error) {
      console.error("Error updating plan entry:", error);
      toast.error("Failed to update meal");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter entries by the specific dates in the current week view
  const filterEntriesByWeekDay = (
    entries: PlanEntry[],
    day: string,
    mealType: string
  ) => {
    const targetDate = weekDates[day];
    if (!targetDate) return [];

    return entries.filter((entry) => {
      try {
        // Parse the entry date
        const entryDate = parseISO(entry.date);
        // Check if it's the same day as our target date AND the correct meal type
        return isSameDay(entryDate, targetDate) && entry.meal_type === mealType;
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    });
  };

  // Group entries by day and meal type for the specific week
  const entriesByDayAndType = days.reduce((acc, day) => {
    acc[day] = mealTypes.reduce((mealAcc, type) => {
      mealAcc[type] = filterEntriesByWeekDay(entries, day, type);
      return mealAcc;
    }, {} as Record<string, PlanEntry[]>);
    return acc;
  }, {} as Record<string, Record<string, PlanEntry[]>>);

  return (
    <div className="flex flex-col space-y-6">
      {/* Week navigation controls */}
      <div className="flex justify-between items-center mb-2">
        <Button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous Week</span>
        </Button>

        <div className="text-center">
          <h2 className="font-medium text-sm sm:text-base">
            {getWeekRangeText()}
          </h2>
        </div>

        <div className="flex gap-2">
          {weekOffset !== 0 && (
            <Button
              onClick={() => setWeekOffset(0)}
              variant="outline"
              size="sm"
            >
              Current Week
            </Button>
          )}
          <Button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels on desktop */}
      <div className="hidden md:grid md:grid-cols-7 gap-4 mb-2">
        {days.map((day) => (
          <div
            key={`header-${day}`}
            className="text-center font-semibold text-neutral-700 capitalize"
          >
            {day}
            <div className="text-xs text-neutral-500">
              {weekDates[day] ? format(weekDates[day], "MMM d") : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-8">
        {mealTypes.map((mealType) => (
          <div key={mealType} className="space-y-2">
            <h3 className="text-lg font-medium capitalize text-neutral-800">
              {mealType}
            </h3>
            <div className="grid md:grid-cols-7 gap-4">
              {days.map((day) => (
                <div key={`${day}-${mealType}`} className="relative">
                  {/* Day label on mobile */}
                  <div className="md:hidden font-semibold text-neutral-700 capitalize mb-2">
                    {day}
                    <span className="text-xs text-neutral-500 ml-2">
                      {weekDates[day] ? format(weekDates[day], "MMM d") : ""}
                    </span>
                  </div>

                  {entriesByDayAndType[day][mealType].length > 0 ? (
                    // Show meals if they exist
                    <div className="space-y-2">
                      {entriesByDayAndType[day][mealType].map((entry) => (
                        <MealCard
                          key={entry.id}
                          entry={entry}
                          onEdit={() => handleEditClick(entry)}
                          onDelete={() => onDeleteEntry(entry.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    // Empty slot
                    <Card
                      variant="outlined"
                      className="min-h-[100px] flex flex-col items-center justify-center p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => handleDayClick(day, mealType)}
                    >
                      <PlusIcon className="w-5 h-5 text-neutral-400 mb-2" />
                      <span className="text-sm text-neutral-500">Add meal</span>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Meal Selector Modal */}
      <MealSelectorModal
        open={isMealSelectorOpen}
        onOpenChange={setIsMealSelectorOpen}
        onSelectMeal={handleSelectMeal}
      />
    </div>
  );
}

interface MealCardProps {
  entry: PlanEntry;
  onEdit: () => void;
  onDelete: () => void;
}

function MealCard({ entry, onEdit, onDelete }: MealCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fridgePercentage, setFridgePercentage] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    // Fetch fridge items and calculate percentage
    async function calculatePercentage() {
      try {
        // Only proceed if the entry has a meal and the meal has an ID
        if (!entry.meal?.id) return;

        // Fetch meal details to get ingredients
        const mealResponse = await fetch(`/api/meals/${entry.meal.id}`);
        if (!mealResponse.ok) {
          throw new Error("Failed to fetch meal details");
        }

        const mealData = await mealResponse.json();

        // Only calculate if meal has ingredients
        if (mealData.ingredients && mealData.ingredients.length > 0) {
          // Get fridge items
          const fridgeItems = await fridgeService.getAllItems();

          // Calculate percentage
          const percentage = calculateFridgePercentage(
            mealData.ingredients,
            fridgeItems
          );
          setFridgePercentage(percentage);
        }
      } catch (error) {
        console.error("Error calculating fridge percentage:", error);
      }
    }

    calculatePercentage();
  }, [entry.meal?.id]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Get badge variant based on fridge percentage
  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return "success";
    if (percentage >= 50) return "secondary";
    return "default";
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col",
          isHovered ? "ring-2 ring-primary" : ""
        )}
      >
        <div className="p-0 flex flex-col h-full">
          {/* Image container with fixed aspect ratio */}
          <div className="w-full aspect-video overflow-hidden relative">
            <MealImage
              imageUrl={entry.meal?.image_url}
              name={entry.meal?.name || "Unnamed meal"}
              status={entry.meal?.image_status || "completed"}
              className="w-full h-full"
            />

            {/* Fridge percentage badge */}
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
          <div className="bg-white p-2 flex-grow">
            <h3 className="text-sm font-medium text-center truncate">
              {entry.meal?.name || "Unnamed meal"}
            </h3>
          </div>
        </div>

        {/* Action buttons that appear on hover */}
        <div
          className={cn(
            "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <TooltipProvider>
            {showDeleteConfirm ? (
              <div className="flex gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  aria-label="Confirm deletion"
                  onClick={() => onDelete()}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                      onClick={() => onEdit()}
                      aria-label={`Edit ${entry.meal?.name || "meal"}`}
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      onClick={handleDeleteClick}
                      aria-label={`Delete ${entry.meal?.name || "meal"}`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
}
