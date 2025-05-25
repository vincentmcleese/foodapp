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
import { Ingredient } from "@/lib/api-services";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Updated schema to handle both pantry and regular ingredients
const formSchema = z.discriminatedUnion("ingredient_type", [
  // Regular ingredient schema
  z.object({
    ingredient_id: z
      .string()
      .min(1, { message: "Please select an ingredient" }),
    ingredient_type: z.literal("regular"),
    quantity: z.coerce
      .number()
      .positive({ message: "Quantity must be positive" }),
    unit: z.string().min(1, { message: "Please select a unit" }),
    expiry_date: z.string().optional(),
    status: z.undefined(),
  }),
  // Pantry item schema
  z.object({
    ingredient_id: z
      .string()
      .min(1, { message: "Please select an ingredient" }),
    ingredient_type: z.literal("pantry"),
    status: z.enum(["IN_STOCK", "NOT_IN_STOCK"]),
    quantity: z.undefined(),
    unit: z.undefined(),
    expiry_date: z.undefined(),
  }),
]);

export type FridgeItem = {
  id: string;
  ingredient_id: string;
  quantity?: number;
  unit?: string;
  status?: "IN_STOCK" | "NOT_IN_STOCK";
  expiry_date?: string;
  expires_at?: string;
  ingredient?: {
    id: string;
    name: string;
    usda_fdc_id?: string;
    nutrition?: any;
    ingredient_type: "pantry" | "regular";
  };
};

interface FridgeItemFormProps {
  isEditing?: boolean;
  fridgeItem?: FridgeItem;
  onSubmitSuccess?: () => void;
}

export function FridgeItemForm({
  isEditing = false,
  fridgeItem,
  onSubmitSuccess,
}: FridgeItemFormProps) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIngredientType, setSelectedIngredientType] = useState<
    "pantry" | "regular"
  >(fridgeItem?.ingredient?.ingredient_type || "regular");

  // Set up form with conditional default values based on ingredient type
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      selectedIngredientType === "pantry"
        ? {
            ingredient_id: fridgeItem?.ingredient_id || "",
            ingredient_type: "pantry" as const,
            status: fridgeItem?.status || "IN_STOCK",
          }
        : {
            ingredient_id: fridgeItem?.ingredient_id || "",
            ingredient_type: "regular" as const,
            quantity: fridgeItem?.quantity || 1,
            unit: fridgeItem?.unit || "g",
            expiry_date:
              fridgeItem?.expiry_date || fridgeItem?.expires_at || "",
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

  // When ingredient selection changes, update the form based on ingredient type
  useEffect(() => {
    const ingredientId = form.getValues().ingredient_id;
    if (!ingredientId) return;

    const selectedIngredient = ingredients.find((i) => i.id === ingredientId);
    if (selectedIngredient && selectedIngredient.ingredient_type) {
      setSelectedIngredientType(selectedIngredient.ingredient_type);

      // Reset the form with the new ingredient type
      form.reset(
        selectedIngredient.ingredient_type === "pantry"
          ? {
              ingredient_id: ingredientId,
              ingredient_type: "pantry" as const,
              status: fridgeItem?.status || "IN_STOCK",
            }
          : {
              ingredient_id: ingredientId,
              ingredient_type: "regular" as const,
              quantity: fridgeItem?.quantity || 1,
              unit: fridgeItem?.unit || "g",
              expiry_date:
                fridgeItem?.expiry_date || fridgeItem?.expires_at || "",
            }
      );
    }
  }, [form.watch("ingredient_id"), ingredients]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Prepare data based on ingredient type
      const requestData =
        values.ingredient_type === "pantry"
          ? {
              ingredient_id: values.ingredient_id,
              status: values.status,
            }
          : {
              ingredient_id: values.ingredient_id,
              quantity: values.quantity,
              unit: values.unit,
              expiry_date: values.expiry_date,
            };

      if (isEditing && fridgeItem) {
        if (fridgeItem.id.startsWith("temp-")) {
          // This is a new item that needs to be created
          const response = await fetch("/api/fridge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
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
            body: JSON.stringify(requestData),
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
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error("Failed to create fridge item");
        }

        toast.success("Fridge item added successfully");
      }

      // If onSubmitSuccess callback provided, call it first
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        // Otherwise fallback to page navigation
        router.push("/fridge");
        router.refresh();
      }
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
                        {ingredient.name}{" "}
                        {ingredient.ingredient_type === "pantry"
                          ? "(Pantry Item)"
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedIngredientType === "pantry" ? (
            /* Pantry Item Fields */
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="IN_STOCK" />
                        </FormControl>
                        <FormLabel className="font-normal">In Stock</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NOT_IN_STOCK" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Not In Stock
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            /* Regular Ingredient Fields */
            <>
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
            </>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
