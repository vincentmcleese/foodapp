"use client";

import { useState } from "react";
import { Card } from "@/components/common/Card";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SaveIcon, XIcon } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
}

interface IngredientFormProps {
  ingredients: Ingredient[];
  onAddItem: (data: {
    ingredient_id: string;
    quantity: number;
    unit: string;
  }) => void;
  onAddIngredient: (name: string) => void;
  onUpdate?: (data: {
    ingredient_id: string;
    quantity: number;
    unit: string;
  }) => void;
  editingItem?: {
    id: string;
    ingredient_id: string;
    quantity: number;
    unit: string;
  } | null;
  loading: boolean;
}

export function IngredientForm({
  ingredients,
  onAddItem,
  onAddIngredient,
  onUpdate,
  editingItem,
  loading,
}: IngredientFormProps) {
  const [form, setForm] = useState({
    ingredient_id: editingItem?.ingredient_id || "",
    quantity: editingItem?.quantity.toString() || "",
    unit: editingItem?.unit || "",
  });
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleNewIngredientForm = () => {
    setShowNewIngredientForm(!showNewIngredientForm);
    setNewIngredientName("");
  };

  const handleAddNewIngredient = () => {
    if (!newIngredientName.trim()) return;
    onAddIngredient(newIngredientName);
    setNewIngredientName("");
    setShowNewIngredientForm(false);
  };

  const handleSubmit = () => {
    if (!form.ingredient_id || !form.quantity || !form.unit) return;

    if (editingItem && onUpdate) {
      onUpdate({
        ingredient_id: form.ingredient_id,
        quantity: Number(form.quantity),
        unit: form.unit,
      });
    } else {
      onAddItem({
        ingredient_id: form.ingredient_id,
        quantity: Number(form.quantity),
        unit: form.unit,
      });
      setForm({ ingredient_id: "", quantity: "", unit: "" });
    }
  };

  return (
    <Card variant="outlined" className="p-6">
      {showNewIngredientForm ? (
        <div className="space-y-4">
          <FormField id="new-ingredient" label="New Ingredient">
            <Input
              id="new-ingredient"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              placeholder="Enter ingredient name"
            />
          </FormField>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={toggleNewIngredientForm}
              leftIcon={<XIcon className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewIngredient}
              disabled={!newIngredientName.trim() || loading}
              loading={loading}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add Ingredient
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            <FormField id="ingredient" label="Ingredient">
              <div className="space-y-1">
                <select
                  id="ingredient"
                  name="ingredient_id"
                  value={form.ingredient_id}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={toggleNewIngredientForm}
                  className="text-sm text-primary hover:underline"
                  type="button"
                >
                  + Add new ingredient
                </button>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="quantity" label="Quantity">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleInputChange}
                  placeholder="Amount"
                />
              </FormField>

              <FormField id="unit" label="Unit">
                <Input
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., g, ml, pcs"
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={
                !form.ingredient_id || !form.quantity || !form.unit || loading
              }
              loading={loading}
              leftIcon={
                editingItem ? (
                  <SaveIcon className="w-4 h-4" />
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )
              }
            >
              {editingItem ? "Update" : "Add to Fridge"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
