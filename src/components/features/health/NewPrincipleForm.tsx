"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HealthPrinciple, healthService } from "@/lib/api-services";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// Define a schema that explicitly includes enabled as required
const principleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

// Explicitly define the form values type to match what the form expects
interface PrincipleFormValues {
  name: string;
  description?: string;
  enabled: boolean;
}

interface NewPrincipleFormProps {
  onPrincipleAdded: (principle: HealthPrinciple) => void;
}

export function NewPrincipleForm({ onPrincipleAdded }: NewPrincipleFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Use explicit generic type that matches our schema
  const form = useForm<PrincipleFormValues>({
    resolver: zodResolver(principleFormSchema) as any, // Use type assertion to bypass resolver type incompatibility
    defaultValues: {
      name: "",
      description: "",
      enabled: true,
    },
  });

  const onSubmit = async (data: PrincipleFormValues) => {
    try {
      setIsLoading(true);
      const newPrinciple = await healthService.createPrinciple(data);
      onPrincipleAdded(newPrinciple);
      toast.success(`${data.name} added successfully`);
      form.reset();
    } catch (error) {
      console.error("Error creating principle:", error);
      toast.error("Failed to create principle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Principle</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter principle name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter principle description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Enabled</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding..." : "Add Principle"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
