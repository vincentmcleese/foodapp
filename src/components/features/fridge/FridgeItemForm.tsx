"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";

const formSchema = z.object({
  ingredient_id: z.string().min(1, { message: "Please select an ingredient" }),
  quantity: z.coerce
    .number()
    .positive({ message: "Quantity must be positive" }),
  unit: z.string().min(1, { message: "Please select a unit" }),
  expiry_date: z.string().optional(),
});

export type FridgeItem = {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  expires_at?: string;
  ingredient?: {
    id: string;
    name: string;
    usda_fdc_id?: string;
    nutrition?: any;
  };
};

interface FridgeItemFormProps {
  isEditing?: boolean;
  fridgeItem?: FridgeItem;
}

export function FridgeItemForm({
  isEditing = false,
  fridgeItem,
}: FridgeItemFormProps) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredient_id: fridgeItem?.ingredient_id || "",
      quantity: fridgeItem?.quantity || 1,
      unit: fridgeItem?.unit || "g",
      expiry_date: fridgeItem?.expiry_date || fridgeItem?.expires_at || "",
    },
  });

  // Fetch ingredients from API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) {
          throw new Error("Failed to fetch ingredients");
        }
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        toast.error("Failed to fetch ingredients");
      }
    };

    fetchIngredients();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isEditing && fridgeItem) {
        if (fridgeItem.id.startsWith("temp-")) {
          // This is a new item that needs to be created
          const response = await fetch("/api/fridge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            throw new Error("Failed to create fridge item");
          }

          toast.success("Fridge item added successfully");
        } else {
          // Update existing fridge item
          const response = await fetch(`/api/fridge/${fridgeItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            throw new Error("Failed to update fridge item");
          }

          toast.success("Fridge item updated successfully");
        }
      } else {
        // Create new fridge item
        const response = await fetch("/api/fridge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error("Failed to create fridge item");
        }

        toast.success("Fridge item added successfully");
      }

      // Redirect back to fridge page
      router.push("/fridge");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        isEditing ? "Failed to update fridge item" : "Failed to add fridge item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const units = ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "piece", "slice"];

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ingredient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingredient</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an ingredient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ingredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
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
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Select expiry date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Item"
              : "Add to Fridge"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
