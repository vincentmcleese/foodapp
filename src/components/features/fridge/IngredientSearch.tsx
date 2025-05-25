"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown, PlusIcon } from "lucide-react";
import { Ingredient, ingredientService } from "@/lib/api-services";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface IngredientSearchProps {
  onSelect: (ingredient: Ingredient | null) => void;
  onCreateNew?: (name: string) => void;
  placeholder?: string;
  className?: string;
}

export function IngredientSearch({
  onSelect,
  onCreateNew,
  placeholder = "Search ingredients...",
  className,
}: IngredientSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  useEffect(() => {
    const searchIngredients = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Searching for:", query);
        const searchResults = await ingredientService.searchIngredients(query);
        console.log("Search results:", searchResults);

        // Log raw search results and data types to debug
        console.log("Search results type:", typeof searchResults);
        console.log("Is array:", Array.isArray(searchResults));
        console.log("Length:", searchResults ? searchResults.length : 0);

        // Ensure we're setting a valid array of results
        setResults(Array.isArray(searchResults) ? searchResults : []);
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

  const handleSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    onSelect(ingredient);
    setOpen(false);
  };

  const handleCreateNew = () => {
    if (onCreateNew && query.trim()) {
      onCreateNew(query.trim());
      setOpen(false);
    }
  };

  // This makes sure the popover opens automatically when typing
  useEffect(() => {
    if (query.length >= 2 && !open) {
      setOpen(true);
    }
  }, [query, open]);

  // Let's directly render the search results without the shadcn Command component
  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-4">
          <Spinner size="md" />
        </div>
      );
    }

    if (results.length === 0 && query.length >= 2) {
      return (
        <div className="p-2">
          <p className="text-sm text-center mb-2">No ingredients found</p>
          {onCreateNew && (
            <Button
              variant="ghost"
              className="w-full text-sm justify-start"
              onClick={handleCreateNew}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add "{query}" as new ingredient
            </Button>
          )}
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <div className="p-2">
          <p className="text-xs text-gray-500 mb-2">
            Found {results.length} results
          </p>
          <div className="space-y-1">
            {results.map((ingredient) => (
              <div
                key={ingredient.id}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                  selectedIngredient?.id === ingredient.id ? "bg-gray-100" : ""
                }`}
                onClick={() => handleSelect(ingredient)}
              >
                <span>{ingredient.name}</span>
                {selectedIngredient?.id === ingredient.id && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="p-2 text-center text-sm text-gray-500">
        Type at least 2 characters to search
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {/* Fallback input for direct entry */}
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full mb-1"
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            {selectedIngredient ? selectedIngredient.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 max-h-[400px] overflow-auto">
          {renderSearchResults()}
        </PopoverContent>
      </Popover>

      {/* Debug output */}
      <div className="mt-2 text-xs text-gray-500">
        <div>Query: {query}</div>
        <div>Results: {results.length}</div>
        <div>Selected: {selectedIngredient?.name}</div>
      </div>
    </div>
  );
}
