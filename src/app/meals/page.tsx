import React from "react";
import { Card } from "@/components/ui/card";

export default function MealsPage() {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Meals</h2>
      <p className="text-muted-foreground">
        Plan, view, and manage your meals here.
      </p>
    </Card>
  );
}
