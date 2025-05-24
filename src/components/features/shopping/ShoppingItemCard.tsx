"use client";

import { ShoppingItem } from "@/lib/api-services";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Check, AlertCircle } from "lucide-react";

interface ShoppingItemCardProps {
  item: ShoppingItem;
}

export function ShoppingItemCard({ item }: ShoppingItemCardProps) {
  const { name, required, unit, inStock, status } = item;

  const getStatusBadge = () => {
    switch (status) {
      case "in-stock":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            In Stock
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            Partial ({inStock}/{required} {unit})
          </Badge>
        );
      case "need-to-buy":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
          >
            <ShoppingBag className="h-3 w-3" />
            Need to Buy
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{name}</h3>
          <p className="text-muted-foreground text-sm">
            {required} {unit} needed
            {inStock > 0 && ` (${inStock} ${unit} in fridge)`}
          </p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>
    </Card>
  );
}
