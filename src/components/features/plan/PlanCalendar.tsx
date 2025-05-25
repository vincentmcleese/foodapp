"use client";

import { useState } from "react";
import { PlanEntry } from "@/lib/api-services";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";

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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full justify-center"
                        onClick={() => handleDayClick(day, mealType)}
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add meal
                      </Button>
                    </div>
                  ) : (
                    // Empty slot
                    <Card
                      variant="outlined"
                      className="min-h-[100px] flex flex-col items-center justify-center p-4 hover:border-primary/50 transition-colors"
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
  return (
    <Card className="p-4 relative group hover:shadow-md transition-all">
      {/* Meal information */}
      <div className="mb-3">
        <h4 className="font-medium text-neutral-800 text-base">
          {entry.meal?.name || "Unnamed meal"}
        </h4>
        {entry.meal?.description && (
          <p className="text-neutral-600 text-sm mt-1 line-clamp-2">
            {entry.meal.description}
          </p>
        )}
      </div>

      {/* Action buttons in a footer */}
      <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <EditIcon className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <TrashIcon className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
