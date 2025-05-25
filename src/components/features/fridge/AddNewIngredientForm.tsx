"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ingredient, ingredientService } from "@/lib/api-services";
import { imageQueue } from "@/lib/image-generation-queue";
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

interface AddNewIngredientFormProps {
  initialName: string;
  onIngredientCreated: (ingredient: Ingredient) => void;
  onClose: () => void;
}

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ingredientType: z.enum(["regular", "pantry"]),
});

type FormValues = z.infer<typeof formSchema>;

export function AddNewIngredientForm({
  initialName,
  onIngredientCreated,
  onClose,
}: AddNewIngredientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName,
      ingredientType: "regular",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Create a new ingredient with pending image status
      const newIngredient = await ingredientService.createIngredient({
        name: data.name,
        image_status: "pending",
        ingredient_type: data.ingredientType as "pantry" | "regular",
      });

      // Queue image generation
      imageQueue.enqueue(newIngredient.id);

      toast({
        title: "Ingredient created",
        description: `${data.name} was created and image generation was queued.`,
      });

      // Call the callback with the new ingredient
      onIngredientCreated(newIngredient);
      onClose();
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to create ingredient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ingredientType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Ingredient Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="regular" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Regular Ingredient
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pantry" />
                      </FormControl>
                      <FormLabel className="font-normal">Pantry Item</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              {isSubmitting ? "Creating..." : "Create & Add"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
