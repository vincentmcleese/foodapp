"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";

const formSchema = z.object({
  meal_id: z.string().min(1, { message: "Please select a meal" }),
  date: z.date({
    required_error: "Please select a date",
  }),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"], {
    required_error: "Please select a meal type",
  }),
});

export type PlanEntry = {
  id: string;
  meal_id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  meal?: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    nutrition?: any;
  };
};

interface PlanEntryFormProps {
  isEditing?: boolean;
  entry?: PlanEntry;
}

export function PlanEntryForm({
  isEditing = false,
  entry,
}: PlanEntryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meals, setMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get initial values from searchParams or entry
  const initialMealType = searchParams?.get("type") as
    | "breakfast"
    | "lunch"
    | "dinner"
    | "snack"
    | undefined;

  // Safely parse date string and ensure it's valid
  const getValidDate = (dateStr: string | null): Date => {
    if (!dateStr) return new Date();

    const parsedDate = new Date(dateStr);
    return isValid(parsedDate) ? parsedDate : new Date();
  };

  const initialDate = searchParams?.get("day")
    ? getValidDate(searchParams.get("day"))
    : entry?.date
    ? getValidDate(entry.date)
    : new Date();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meal_id: entry?.meal_id || "",
      date: initialDate,
      meal_type: entry?.meal_type || initialMealType || "dinner",
    },
  });

  // Fetch meals from API
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals");
        if (!response.ok) {
          throw new Error("Failed to fetch meals");
        }
        const data = await response.json();
        setMeals(data);
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error("Failed to fetch meals");
      }
    };

    fetchMeals();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Ensure we have a valid date
      if (!isValid(values.date)) {
        throw new Error("Invalid date selected");
      }

      if (isEditing && entry) {
        // Update existing plan entry
        const response = await fetch(`/api/plan/${entry.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meal_id: values.meal_id,
            date: values.date.toISOString().split("T")[0],
            meal_type: values.meal_type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update plan entry");
        }

        toast.success("Plan entry updated successfully");
      } else {
        // Create new plan entry
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meal_id: values.meal_id,
            date: values.date.toISOString().split("T")[0],
            meal_type: values.meal_type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create plan entry");
        }

        toast.success("Plan entry created successfully");
      }

      // Redirect back to plan page
      router.push("/plan");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        isEditing
          ? "Failed to update plan entry"
          : "Failed to create plan entry"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely format a date
  const formatDate = (date: Date | null | undefined): string => {
    if (!date || !isValid(date)) {
      return "Select a date";
    }
    return format(date, "PPP");
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="meal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a meal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {meals.map((meal) => (
                      <SelectItem key={meal.id} value={meal.id}>
                        {meal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {formatDate(field.value)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meal_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a meal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Plan Entry"
              : "Add to Plan"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
