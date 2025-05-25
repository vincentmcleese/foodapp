"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { Ingredient, ingredientService } from "@/lib/api-services";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { imageQueue } from "@/lib/image-generation-queue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddQuantityForm } from "./AddQuantityForm";
import { AddNewIngredientForm } from "./AddNewIngredientForm";

interface FridgeSearchProps {
  onItemAdded?: () => void;
}

export function FridgeSearch({ onItemAdded }: FridgeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAddingQuantity, setIsAddingQuantity] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Handle search input changes
  useEffect(() => {
    const searchIngredients = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      setShowResults(true);

      try {
        console.log("Searching for:", query);
        const searchResults = await ingredientService.searchIngredients(query);
        console.log("Search results:", searchResults);

        // Ensure we're setting a valid array of results
        if (Array.isArray(searchResults)) {
          setResults(searchResults);
        } else {
          console.warn("Search results is not an array:", searchResults);
          setResults([]);
        }
      } catch (error) {
        console.error("Error searching ingredients:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchIngredients, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle selection of an ingredient
  const handleSelectIngredient = (ingredient: Ingredient) => {
    console.log("Selected ingredient:", ingredient);
    setSelectedIngredient(ingredient);
    setIsAddingQuantity(true);
    setShowResults(false);
    setQuery("");
  };

  // Handle adding a new ingredient
  const handleAddNew = () => {
    if (!query.trim()) return;
    setIsAddingNew(true);
    setShowResults(false);
  };

  // Clear search input
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  // Handle focus on the input field
  const handleFocus = () => {
    if (query.length >= 2) {
      setShowResults(true);
    }
  };

  // Handle when an item is successfully added
  const handleItemAdded = () => {
    // Notify parent component
    if (onItemAdded) {
      onItemAdded();
    }

    // Close any open dialogs
    setIsAddingQuantity(false);
    setIsAddingNew(false);
  };

  // Handle adding a newly created ingredient
  const handleIngredientCreated = (ingredient: Ingredient) => {
    console.log("Ingredient created:", ingredient);
    setSelectedIngredient(ingredient);

    // If it's a pantry item, add it directly as IN_STOCK
    if (ingredient.ingredient_type === "pantry") {
      addPantryItem(ingredient.id);
    } else {
      // For regular items, open quantity dialog
      setIsAddingQuantity(true);
    }
  };

  // Add pantry item directly (always IN_STOCK when adding new)
  const addPantryItem = async (ingredientId: string) => {
    try {
      await fetch("/api/fridge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredient_id: ingredientId,
          status: "IN_STOCK",
        }),
      });

      toast({
        title: "Success",
        description: "Item added to your pantry.",
      });

      // Notify parent that an item was added
      handleItemAdded();
    } catch (error) {
      console.error("Error adding pantry item:", error);
      toast({
        title: "Error",
        description: "Failed to add pantry item.",
        variant: "destructive",
      });
    }
  };

  // Debugging information
  console.log("Current state:", {
    query,
    resultsLength: results.length,
    isLoading,
    showResults,
    hasIngredients: results && results.length > 0,
  });

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="Search for ingredients..."
            className="pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search results */}
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-80 overflow-auto border">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <Spinner size="sm" />
              </div>
            ) : results.length > 0 ? (
              <ul className="py-1">
                {results.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    onClick={() => handleSelectIngredient(ingredient)}
                    className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center"
                  >
                    {ingredient.image_url ? (
                      <div className="w-8 h-8 mr-3 relative overflow-hidden rounded-full">
                        <Image
                          src={ingredient.image_url}
                          alt={ingredient.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 mr-3 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {ingredient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="flex-1">{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            ) : query.length >= 2 ? (
              <div className="p-3">
                <p className="text-sm text-muted-foreground mb-2">
                  No ingredients found
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleAddNew}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add "{query}" as new ingredient
                </Button>
              </div>
            ) : (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog for adding quantity to existing ingredient */}
      <Dialog open={isAddingQuantity} onOpenChange={setIsAddingQuantity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Fridge</DialogTitle>
            <DialogDescription>
              {selectedIngredient?.name
                ? `Add ${selectedIngredient.name} to your fridge`
                : "Add ingredient to your fridge"}
            </DialogDescription>
          </DialogHeader>
          {selectedIngredient && (
            <AddQuantityForm
              ingredient={selectedIngredient}
              onClose={() => setIsAddingQuantity(false)}
              onItemAdded={handleItemAdded}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for creating new ingredient */}
      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ingredient</DialogTitle>
            <DialogDescription>
              Create a new ingredient and add it to your fridge
            </DialogDescription>
          </DialogHeader>
          <AddNewIngredientForm
            initialName={query}
            onIngredientCreated={handleIngredientCreated}
            onClose={() => setIsAddingNew(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
