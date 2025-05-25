"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ingredient } from "@/lib/api-services";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface AddQuantityFormProps {
  ingredient: Ingredient;
  onClose: () => void;
  onItemAdded?: () => void;
}

// Form schema with discriminated union for different ingredient types
const formSchema = z.discriminatedUnion("ingredientType", [
  // Regular ingredient schema
  z.object({
    ingredientType: z.literal("regular"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
  }),
  // Pantry item schema
  z.object({
    ingredientType: z.literal("pantry"),
    status: z.enum(["IN_STOCK", "NOT_IN_STOCK"]),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

export function AddQuantityForm({
  ingredient,
  onClose,
  onItemAdded,
}: AddQuantityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      ingredient.ingredient_type === "pantry"
        ? {
            ingredientType: "pantry" as const,
            status: "IN_STOCK",
          }
        : {
            ingredientType: "regular" as const,
            quantity: 1,
            unit: "pcs",
          },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare data based on ingredient type
      const requestData =
        data.ingredientType === "pantry"
          ? {
              ingredient_id: ingredient.id,
              status: data.status,
            }
          : {
              ingredient_id: ingredient.id,
              quantity: data.quantity,
              unit: data.unit,
            };

      // Add to fridge
      const response = await fetch("/api/fridge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to add to fridge");
      }

      toast({
        title: "Success",
        description: `${ingredient.name} added to your fridge.`,
      });

      // Reset form and close dialog
      form.reset();
      onClose();
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error("Error adding to fridge:", error);
      toast({
        title: "Error",
        description: "Failed to add to fridge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Ingredient info */}
      <div className="flex items-center space-x-3 mb-4">
        {ingredient.image_url ? (
          <div className="w-16 h-16 relative rounded-md overflow-hidden">
            <Image
              src={ingredient.image_url}
              alt={ingredient.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <span className="text-xl text-muted-foreground">
              {ingredient.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-medium">{ingredient.name}</h3>
          <p className="text-sm text-muted-foreground">
            {ingredient.ingredient_type === "pantry"
              ? "Pantry Item"
              : "Regular Ingredient"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {ingredient.ingredient_type === "regular" ? (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0.1" {...field} />
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue="IN_STOCK"
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
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Fridge"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
