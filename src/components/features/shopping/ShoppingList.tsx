"use client";

import { useState, useEffect } from "react";
import {
  ShoppingList as ShoppingListType,
  shoppingService,
} from "@/lib/api-services";
import { ShoppingItemCard } from "./ShoppingItemCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, RefreshCcw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ShoppingList() {
  const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchShoppingList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await shoppingService.getShoppingList();
      setShoppingList(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shopping list"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const handleRefresh = () => {
    fetchShoppingList();
  };

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-2">
          Failed to load shopping list
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!shoppingList || shoppingList.totalItems === 0) {
    return (
      <Card className="p-6 text-center">
        <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-2">No items needed</h3>
        <p className="text-muted-foreground mb-4">
          Your meal plan doesn't require any ingredients or all needed items are
          already in your fridge.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh List
        </Button>
      </Card>
    );
  }

  const {
    shoppingList: items,
    totalItems,
    needToBuy,
    partial,
    inStock,
  } = shoppingList;

  const filteredItems = () => {
    switch (activeTab) {
      case "need-to-buy":
        return items.filter((item) => item.status === "need-to-buy");
      case "partial":
        return items.filter((item) => item.status === "partial");
      case "in-stock":
        return items.filter((item) => item.status === "in-stock");
      case "all":
      default:
        return items;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Shopping List
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({totalItems} items)
          </span>
        </h2>
        <Button onClick={handleRefresh} size="sm" variant="ghost">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All ({totalItems})</TabsTrigger>
          <TabsTrigger value="need-to-buy">
            <ShoppingBag className="w-3 h-3 mr-1" />
            To Buy ({needToBuy})
          </TabsTrigger>
          <TabsTrigger value="partial">
            <AlertCircle className="w-3 h-3 mr-1" />
            Partial ({partial})
          </TabsTrigger>
          <TabsTrigger value="in-stock">
            <Check className="w-3 h-3 mr-1" />
            In Stock ({inStock})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredItems().map((item) => (
            <ShoppingItemCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
