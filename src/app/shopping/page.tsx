import React from "react";
import { Card } from "@/components/ui/card";

export default function ShoppingPage() {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Shopping</h2>
      <p className="text-muted-foreground">
        Generate and manage your shopping lists here.
      </p>
    </Card>
  );
}
