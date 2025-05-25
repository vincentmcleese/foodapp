"use client";

import { useState } from "react";
import { PlanEntry } from "@/lib/api-services";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { MealImage } from "../meals/MealImage";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  // Get the current week's start date (Monday)
  const getCurrentWeekDates = () => {
    // Start with current date and find the most recent Monday
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days to subtract to get to Monday (if today is Sunday, subtract 6 days)
    const daysToSubtract = day === 0 ? 6 : day - 1;

    // Get Monday by subtracting the appropriate number of days
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToSubtract);

    // Reset to midnight
    monday.setHours(0, 0, 0, 0);

    // Create mapping of day names to actual dates for this week
    return days.reduce((acc, day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      acc[day] = date;
      return acc;
    }, {} as Record<string, Date>);
  };

  const weekDates = getCurrentWeekDates();

  // Helper function to get day of week from date
  const getDayOfWeek = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
    // but our grid starts with Monday, so we need to map them correctly
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert JavaScript day index to our days array index
    // Sunday (0) -> index 6
    // Monday (1) -> index 0
    // Tuesday (2) -> index 1
    // etc.
    const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    return days[mappedIndex];
  };

  // Modified handleAddEntry to pass the actual date for the selected day
  const handleDayClick = (day: string, mealType: string) => {
    const dateForDay = weekDates[day];
    const formattedDate = format(dateForDay, "yyyy-MM-dd");
    onAddEntry(formattedDate, mealType);
  };

  // Group entries by day and meal type
  const entriesByDayAndType = days.reduce((acc, day) => {
    acc[day] = mealTypes.reduce((mealAcc, type) => {
      mealAcc[type] = entries.filter(
        (entry) => getDayOfWeek(entry.date) === day && entry.meal_type === type
      );
      return mealAcc;
    }, {} as Record<string, PlanEntry[]>);
    return acc;
  }, {} as Record<string, Record<string, PlanEntry[]>>);

  return (
    <div className="flex flex-col space-y-6">
      {/* Day labels on desktop */}
      <div className="hidden md:grid md:grid-cols-7 gap-4 mb-2">
        {days.map((day) => (
          <div
            key={`header-${day}`}
            className="text-center font-semibold text-neutral-700 capitalize"
          >
            {day}
            <div className="text-xs text-neutral-500">
              {format(weekDates[day], "MMM d")}
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
                      {format(weekDates[day], "MMM d")}
                    </span>
                  </div>

                  {entriesByDayAndType[day][mealType].length > 0 ? (
                    // Show meals if they exist
                    <div className="space-y-2">
                      {entriesByDayAndType[day][mealType].map((entry) => (
                        <MealCard
                          key={entry.id}
                          entry={entry}
                          onEdit={() => onEditEntry(entry)}
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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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
          <div className="w-full aspect-video overflow-hidden">
            <MealImage
              imageUrl={entry.meal?.image_url}
              name={entry.meal?.name || "Unnamed meal"}
              status={entry.meal?.image_status || "completed"}
              className="w-full h-full"
            />
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
