"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewPrincipleForm } from "@/components/features/health/NewPrincipleForm";
import { HealthPrinciple } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function NewHealthPrinciplePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrincipleAdded = (principle: HealthPrinciple) => {
    setIsSubmitting(true);
    // Redirect to the health page after adding a principle
    router.push("/health");
  };

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Add New Health Principle</h1>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <p className="text-muted-foreground mb-6">
          Add a new science-based principle to guide your meal planning and
          dietary choices. These principles will help you make healthier food
          choices aligned with nutritional science.
        </p>

        <NewPrincipleForm onPrincipleAdded={handlePrincipleAdded} />
      </Card>
    </div>
  );
}
