"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { fridgeService, ingredientService, FridgeItem, Ingredient } from "@/lib/api-services";

export default function FridgePage() {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [form, setForm] = useState({ ingredient_id: "", quantity: "", unit: "" });
  const [newIngredient, setNewIngredient] = useState({ name: "" });
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load fridge items and ingredients on page load
  useEffect(() => {
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

    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIngredient({ ...newIngredient, [e.target.name]: e.target.value });
  };

  const toggleNewIngredientForm = () => {
    setShowNewIngredientForm(!showNewIngredientForm);
  };

  const handleAddNewIngredient = async () => {
    if (!newIngredient.name) return;
    
    try {
      setLoading(true);
      const addedIngredient = await ingredientService.addIngredient({
        name: newIngredient.name
      });
      
      // Update the ingredients list
      setIngredients([...ingredients, addedIngredient]);
      
      // Select the new ingredient
      setForm({ ...form, ingredient_id: addedIngredient.id });
      
      // Clear and hide the new ingredient form
      setNewIngredient({ name: "" });
      setShowNewIngredientForm(false);
      setError(null);
    } catch (err) {
      console.error("Failed to add ingredient:", err);
      setError("Failed to add ingredient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.ingredient_id || !form.quantity || !form.unit) return;
    
    try {
      setLoading(true);
      const newItem = await fridgeService.addItem({
        ingredient_id: form.ingredient_id,
        quantity: Number(form.quantity),
        unit: form.unit
      });
      
      // Add the ingredient data to the new item
      const ingredient = ingredients.find(i => i.id === form.ingredient_id);
      if (ingredient) {
        newItem.ingredient = ingredient;
      }
      
      setFridgeItems([...fridgeItems, newItem]);
      setForm({ ingredient_id: "", quantity: "", unit: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to add item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const item = fridgeItems.find((i) => i.id === id);
    if (!item) return;
    setForm({
      ingredient_id: item.ingredient_id,
      quantity: String(item.quantity),
      unit: item.unit
    });
    setEditingId(id);
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      setLoading(true);
      const updatedItem = await fridgeService.updateItem(editingId, {
        ingredient_id: form.ingredient_id,
        quantity: Number(form.quantity),
        unit: form.unit
      });
      
      // Update the local state
      setFridgeItems(fridgeItems.map(item => 
        item.id === editingId ? updatedItem : item
      ));
      
      setForm({ ingredient_id: "", quantity: "", unit: "" });
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

  if (loading && fridgeItems.length === 0) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-2">Fridge Inventory</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card className="mb-4 p-4 flex flex-col gap-2">
        {!showNewIngredientForm ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <select
                  name="ingredient_id"
                  value={form.ingredient_id}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={toggleNewIngredientForm}
                  className="text-sm text-blue-600 mt-1"
                >
                  + Add new ingredient
                </button>
              </div>
              <input
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                className="border rounded px-2 py-1 w-20"
              />
              <input
                name="unit"
                placeholder="Unit"
                value={form.unit}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-20"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-end">
              <input
                name="name"
                placeholder="New ingredient name"
                value={newIngredient.name}
                onChange={handleNewIngredientChange}
                className="border rounded px-2 py-1 flex-1"
              />
              <button 
                onClick={handleAddNewIngredient} 
                className="bg-blue-600 text-white rounded px-3 py-1"
                disabled={loading || !newIngredient.name}
              >
                {loading ? "Adding..." : "Add"}
              </button>
              <button 
                onClick={toggleNewIngredientForm}
                className="border rounded px-2 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {!showNewIngredientForm && (
          <div className="flex justify-end">
            {editingId ? (
              <button 
                onClick={handleSave} 
                className="bg-blue-600 text-white rounded px-3 py-1"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            ) : (
              <button 
                onClick={handleAdd} 
                className="bg-green-600 text-white rounded px-3 py-1"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            )}
          </div>
        )}
      </Card>
      
      {fridgeItems.length === 0 ? (
        <div className="text-gray-500">No items in your fridge</div>
      ) : (
        <div className="space-y-2">
          {fridgeItems.map((item) => (
            <Card key={item.id} className="flex items-center gap-2 p-2">
              <span className="font-medium flex-1">{item.ingredient?.name || 'Unknown'}</span>
              <span>{item.quantity}</span>
              <span>{item.unit}</span>
              <button 
                onClick={() => handleEdit(item.id)} 
                className="border rounded px-2 py-1"
                disabled={loading}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="border rounded px-2 py-1 text-red-600"
                disabled={loading}
              >
                Delete
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
