"use client";

import { useState } from "react";
import { HealthPrinciple } from "@/lib/api-services";
import { HealthPrincipleCard } from "./HealthPrincipleCard";
import { NewPrincipleForm } from "./NewPrincipleForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface ClientHealthPageProps {
  initialPrinciples: HealthPrinciple[];
}

export function ClientHealthPage({ initialPrinciples }: ClientHealthPageProps) {
  const [principles, setPrinciples] =
    useState<HealthPrinciple[]>(initialPrinciples);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggle = (updatedPrinciple: HealthPrinciple) => {
    setPrinciples((prevPrinciples) =>
      prevPrinciples.map((principle) =>
        principle.id === updatedPrinciple.id ? updatedPrinciple : principle
      )
    );
  };

  const handleDelete = (id: string) => {
    setPrinciples((prevPrinciples) =>
      prevPrinciples.filter((principle) => principle.id !== id)
    );
  };

  const handlePrincipleAdded = (newPrinciple: HealthPrinciple) => {
    setPrinciples((prevPrinciples) => [newPrinciple, ...prevPrinciples]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Principles</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          {showAddForm ? (
            "Cancel"
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              Add Principle
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <NewPrincipleForm onPrincipleAdded={handlePrincipleAdded} />
        </div>
      )}

      {principles.length > 0 ? (
        <div className="grid gap-4">
          {principles.map((principle) => (
            <HealthPrincipleCard
              key={principle.id}
              principle={principle}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">
            No health principles found. Add your first principle to get started.
          </p>
        </div>
      )}
    </div>
  );
}
