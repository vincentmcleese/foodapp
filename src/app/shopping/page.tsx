import React from "react";
import { ShoppingList } from "@/components/features/shopping/ShoppingList";
import { PageLayout } from "@/components/common/PageLayout";

export default function ShoppingPage() {
  return (
    <PageLayout
      title="Shopping List"
      subtitle="Items needed for your meal plan"
    >
      <div className="space-y-6">
        <ShoppingList />
      </div>
    </PageLayout>
  );
}
