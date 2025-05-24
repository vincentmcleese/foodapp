import React from "react";
import { Card } from "@/components/ui/card";

export default function FridgePage() {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Fridge</h2>
      <p className="text-muted-foreground">Track your fridge inventory here.</p>
    </Card>
  );
}
