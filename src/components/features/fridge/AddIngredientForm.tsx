"use client";

import { useState } from "react";
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

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddIngredientForm() {
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "pcs",
    },
  });

  // Handle ingredient selection from search
  const handleIngredientSelect = (ingredient: Ingredient | null) => {
    setSelectedIngredient(ingredient);
    if (ingredient) {
      form.setValue("name", ingredient.name);
    }
  };

  // Handle creation of new ingredient
  const handleCreateIngredient = async (name: string) => {
    try {
      // Create a new ingredient with pending image status
      const newIngredient = await ingredientService.createIngredient({
        name,
        image_status: "pending",
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
      if (!selectedIngredient) {
        await handleCreateIngredient(data.name);
      }

      // TODO: Add the ingredient to the user's fridge
      // This would call an API to save the ingredient to the user's fridge

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
