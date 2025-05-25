import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IngredientSearch } from "@/components/features/fridge/IngredientSearch";
import { ingredientService } from "@/lib/api-services";

// Mock the ingredientService
jest.mock("@/lib/api-services", () => ({
  ingredientService: {
    searchIngredients: jest.fn(),
  },
}));

describe("IngredientSearch", () => {
  const mockOnSelect = jest.fn();
  const mockOnCreateNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search input", () => {
    render(
      <IngredientSearch
        onSelect={mockOnSelect}
        onCreateNew={mockOnCreateNew}
        placeholder="Search for ingredients"
      />
    );

    expect(
      screen.getByPlaceholderText("Search for ingredients")
    ).toBeInTheDocument();
  });

  it("shows search results when typing", async () => {
    // Mock the search results
    const mockResults = [
      { id: "1", name: "Eggs" },
      { id: "2", name: "Milk" },
    ];
    (ingredientService.searchIngredients as jest.Mock).mockResolvedValue(
      mockResults
    );

    render(
      <IngredientSearch
        onSelect={mockOnSelect}
        onCreateNew={mockOnCreateNew}
        placeholder="Search for ingredients"
      />
    );

    // Type in the search input
    const input = screen.getByPlaceholderText("Search for ingredients");
    fireEvent.change(input, { target: { value: "eg" } });

    // Wait for the search results to appear
    await waitFor(() => {
      expect(ingredientService.searchIngredients).toHaveBeenCalledWith("eg");
    });

    // Check that the results are displayed
    await waitFor(() => {
      expect(screen.getByText("Found 2 results")).toBeInTheDocument();
      expect(screen.getByText("Eggs")).toBeInTheDocument();
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });
  });

  it("calls onSelect when an ingredient is selected", async () => {
    // Mock the search results
    const mockResults = [
      { id: "1", name: "Eggs" },
      { id: "2", name: "Milk" },
    ];
    (ingredientService.searchIngredients as jest.Mock).mockResolvedValue(
      mockResults
    );

    render(
      <IngredientSearch
        onSelect={mockOnSelect}
        onCreateNew={mockOnCreateNew}
        placeholder="Search for ingredients"
      />
    );

    // Type in the search input
    const input = screen.getByPlaceholderText("Search for ingredients");
    fireEvent.change(input, { target: { value: "eg" } });

    // Wait for the search results to appear
    await waitFor(() => {
      expect(screen.getByText("Eggs")).toBeInTheDocument();
    });

    // Click on an ingredient
    fireEvent.click(screen.getByText("Eggs"));

    // Check that onSelect was called with the correct ingredient
    expect(mockOnSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it("calls onCreateNew when the create button is clicked", async () => {
    // Mock empty search results
    (ingredientService.searchIngredients as jest.Mock).mockResolvedValue([]);

    render(
      <IngredientSearch
        onSelect={mockOnSelect}
        onCreateNew={mockOnCreateNew}
        placeholder="Search for ingredients"
      />
    );

    // Type in the search input
    const input = screen.getByPlaceholderText("Search for ingredients");
    fireEvent.change(input, { target: { value: "New Ingredient" } });

    // Wait for the no results message to appear
    await waitFor(() => {
      expect(screen.getByText("No ingredients found")).toBeInTheDocument();
    });

    // Click on the create button
    fireEvent.click(screen.getByText('Add "New Ingredient" as new ingredient'));

    // Check that onCreateNew was called with the correct name
    expect(mockOnCreateNew).toHaveBeenCalledWith("New Ingredient");
  });
});
