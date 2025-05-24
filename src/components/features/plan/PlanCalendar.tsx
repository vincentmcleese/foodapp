"use client";

import { useState } from "react";
import { PlanEntry } from "@/lib/api-services";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon } from "lucide-react";

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

  // Helper function to get day of week from date
  const getDayOfWeek = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[date.getDay()];
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
                        onClick={() => onAddEntry(day, mealType)}
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
                      onClick={() => onAddEntry(day, mealType)}
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
