import React from "react";
import { Card } from "@/components/ui/card";

export default function PlanPage() {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Plan</h2>
      <p className="text-muted-foreground">
        Organize your weekly meal plan here.
      </p>
    </Card>
  );
}
