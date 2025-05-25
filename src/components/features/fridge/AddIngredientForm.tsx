"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ingredient, ingredientService } from "@/lib/api-services";
import { imageQueue } from "@/lib/image-generation-queue";
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
import { IngredientSearch } from "./IngredientSearch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Form schema with discriminated union for different ingredient types
const formSchema = z.discriminatedUnion("ingredientType", [
  // Regular ingredient schema
  z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    ingredientType: z.literal("regular"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
  }),
  // Pantry item schema
  z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    ingredientType: z.literal("pantry"),
    status: z.enum(["IN_STOCK", "NOT_IN_STOCK"]),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

export function AddIngredientForm() {
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredientType, setIngredientType] = useState<"regular" | "pantry">(
    "regular"
  );
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ingredientType: "regular",
      quantity: 1,
      unit: "pcs",
    },
  });

  // Update form when ingredient type changes
  useEffect(() => {
    // Reset the form with appropriate defaults based on ingredient type
    if (ingredientType === "regular") {
      form.reset({
        name: form.getValues().name,
        ingredientType: "regular",
        quantity: 1,
        unit: "pcs",
      });
    } else {
      form.reset({
        name: form.getValues().name,
        ingredientType: "pantry",
        status: "IN_STOCK",
      });
    }
  }, [ingredientType, form]);

  // Handle ingredient selection from search
  const handleIngredientSelect = (ingredient: Ingredient | null) => {
    setSelectedIngredient(ingredient);
    if (ingredient) {
      form.setValue("name", ingredient.name);
      if (ingredient.ingredient_type) {
        setIngredientType(ingredient.ingredient_type);
      }
    }
  };

  // Handle creation of new ingredient
  const handleCreateIngredient = async (name: string) => {
    try {
      // Create a new ingredient with pending image status
      const newIngredient = await ingredientService.createIngredient({
        name,
        image_status: "pending",
        ingredient_type: ingredientType,
      });

      // Update form and selected ingredient
      setSelectedIngredient(newIngredient);
      form.setValue("name", newIngredient.name);

      // Queue image generation
      imageQueue.enqueue(newIngredient.id);

      toast({
        title: "Ingredient created",
        description: `${name} was created and image generation was queued.`,
      });
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to create ingredient. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // If no ingredient selected, create one
      let ingredientId = selectedIngredient?.id;
      if (!ingredientId) {
        const newIngredient = await handleCreateIngredient(data.name);
        ingredientId = selectedIngredient?.id;
        if (!ingredientId) throw new Error("Failed to create ingredient");
      }

      // Add the ingredient to the user's fridge
      if (data.ingredientType === "regular") {
        // Add regular ingredient with quantity
        await fetch("/api/fridge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ingredient_id: ingredientId,
            quantity: data.quantity,
            unit: data.unit,
          }),
        });
      } else {
        // Add pantry item with status
        await fetch("/api/fridge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ingredient_id: ingredientId,
            status: data.status,
          }),
        });
      }

      toast({
        title: "Ingredient added",
        description: `${data.name} was added to your fridge.`,
      });

      // Reset form and redirect
      form.reset();
      setSelectedIngredient(null);
      router.refresh();
    } catch (error) {
      console.error("Error adding ingredient to fridge:", error);
      toast({
        title: "Error",
        description: "Failed to add ingredient to fridge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Ingredient</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient</FormLabel>
                  <FormControl>
                    <IngredientSearch
                      onSelect={handleIngredientSelect}
                      onCreateNew={handleCreateIngredient}
                      placeholder="Search for an ingredient..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="ingredient-type">Ingredient Type:</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="regular"
                    checked={ingredientType === "regular"}
                    onChange={() => setIngredientType("regular")}
                  />
                  <Label htmlFor="regular">Regular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pantry"
                    checked={ingredientType === "pantry"}
                    onChange={() => setIngredientType("pantry")}
                  />
                  <Label htmlFor="pantry">Pantry Item</Label>
                </div>
              </div>
            </div>

            {ingredientType === "regular" ? (
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
                          <FormLabel className="font-normal">
                            In Stock
                          </FormLabel>
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

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add to Fridge"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
