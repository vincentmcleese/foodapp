"use client";
import React, { useState, useEffect } from "react";
import { fridgeService, ingredientService, FridgeItem, Ingredient } from "@/lib/api-services";
import { PageLayout } from "@/components/common/PageLayout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { IngredientForm } from "@/components/features/fridge/IngredientForm";
import { IngredientCard } from "@/components/features/fridge/IngredientCard";
import { PlusIcon, RefreshCwIcon } from "lucide-react";

export default function FridgePage() {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load fridge items and ingredients on page load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get both fridge items and ingredients
      const [fridgeItemsData, ingredientsData] = await Promise.all([
        fridgeService.getAllItems(),
        ingredientService.getAllIngredients()
      ]);
      
      setFridgeItems(fridgeItemsData);
      setIngredients(ingredientsData);
      setError(null);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewIngredient = async (name: string) => {
    try {
      setLoading(true);
      const addedIngredient = await ingredientService.addIngredient({
        name: name
      });
      
      // Update the ingredients list
      setIngredients([...ingredients, addedIngredient]);
      setError(null);
    } catch (err) {
      console.error("Failed to add ingredient:", err);
      setError("Failed to add ingredient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (data: { ingredient_id: string; quantity: number; unit: string }) => {
    try {
      setLoading(true);
      const newItem = await fridgeService.addItem({
        ingredient_id: data.ingredient_id,
        quantity: data.quantity,
        unit: data.unit
      });
      
      // Add the ingredient data to the new item
      const ingredient = ingredients.find(i => i.id === data.ingredient_id);
      if (ingredient) {
        newItem.ingredient = ingredient;
      }
      
      setFridgeItems([...fridgeItems, newItem]);
      setError(null);
    } catch (err) {
      console.error("Failed to add item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleUpdate = async (data: { ingredient_id: string; quantity: number; unit: string }) => {
    if (!editingId) return;
    
    try {
      setLoading(true);
      const updatedItem = await fridgeService.updateItem(editingId, {
        ingredient_id: data.ingredient_id,
        quantity: data.quantity,
        unit: data.unit
      });
      
      // Update the local state
      setFridgeItems(fridgeItems.map(item => 
        item.id === editingId ? updatedItem : item
      ));
      
      setEditingId(null);
      setError(null);
    } catch (err) {
      console.error("Failed to update item:", err);
      setError("Failed to update item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fridgeService.deleteItem(id);
      
      // Update the local state
      setFridgeItems(fridgeItems.filter(item => item.id !== id));
      setError(null);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (loading && fridgeItems.length === 0) {
    return (
      <PageLayout title="Fridge Inventory">
        <div className="flex justify-center items-center h-40">
          <RefreshCwIcon className="animate-spin h-8 w-8 text-primary" />
        </div>
      </PageLayout>
    );
  }

  // Map FridgeItem to the format expected by IngredientCard
  const mapToIngredientCardData = (item: FridgeItem) => {
    return {
      id: item.id,
      name: item.ingredient?.name || 'Unknown',
      quantity: item.quantity,
      unit: item.unit,
      category: item.ingredient?.category || undefined
    };
  };

  // Find the currently editing item
  const currentEditingItem = editingId 
    ? fridgeItems.find(item => item.id === editingId) 
    : null;

  return (
    <PageLayout 
      title="Fridge Inventory" 
      subtitle="Manage your ingredients"
      actions={
        <Button 
          variant="outline" 
          leftIcon={<RefreshCwIcon className="w-4 h-4" />}
          onClick={loadData}
          loading={loading}
        >
          Refresh
        </Button>
      }
    >
      {error && (
        <Card variant="outlined" className="p-4 border-error">
          <p className="text-error">{error}</p>
        </Card>
      )}
      
      <IngredientForm 
        ingredients={ingredients}
        onAddItem={handleAddItem}
        onAddIngredient={handleAddNewIngredient}
        onUpdate={handleUpdate}
        editingItem={currentEditingItem ? {
          id: currentEditingItem.id,
          ingredient_id: currentEditingItem.ingredient_id,
          quantity: currentEditingItem.quantity,
          unit: currentEditingItem.unit
        } : null}
        loading={loading}
      />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Your Ingredients</h3>
        {fridgeItems.length === 0 ? (
          <Card variant="outlined" className="p-8 text-center">
            <p className="text-neutral-600">No items in your fridge yet.</p>
            <p className="text-neutral-500 text-sm mt-2">Add ingredients above to get started.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {fridgeItems.map(item => {
              const ingredientData = mapToIngredientCardData(item);
              const isEditing = item.id === editingId;
              
              if (isEditing) {
                return (
                  <Card key={item.id} variant="highlight" className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Editing {ingredientData.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                );
              }
              
              return (
                <IngredientCard
                  key={item.id}
                  ingredient={ingredientData}
                  variant="compact"
                  onEdit={() => handleEdit(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
