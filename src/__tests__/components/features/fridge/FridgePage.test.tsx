import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FridgePage from "@/app/fridge/page";
import { ingredientService } from "@/lib/api-services";
import { useToast } from "@/components/ui/use-toast";

// Mock the API services
jest.mock("@/lib/api-services", () => ({
  ingredientService: {
    deleteIngredient: jest.fn(),
  },
}));

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

// Mock the Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe("FridgePage", () => {
  const mockIngredients = [
    { id: "1", name: "Eggs", image_url: "https://example.com/eggs.jpg" },
    { id: "2", name: "Milk", image_url: "https://example.com/milk.jpg" },
  ];

  const mockToast = {
    toast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup useToast mock
    (useToast as jest.Mock).mockReturnValue(mockToast);

    // Setup fetch mock for initial data load
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockIngredients,
    });
  });

  it("loads and displays ingredients from API", async () => {
    render(<FridgePage />);

    // Initially shows loading spinner
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByText("Eggs")).toBeInTheDocument();
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith("/api/ingredients");
  });

  it("handles ingredient deletion correctly", async () => {
    // Mock the deleteIngredient function to resolve successfully
    (ingredientService.deleteIngredient as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<FridgePage />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByText("Eggs")).toBeInTheDocument();
    });

    // Find and click the delete button for the first ingredient
    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });
    fireEvent.click(deleteButtons[0]);

    // Find and click the confirm button
    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    });
    fireEvent.click(confirmButton);

    // Verify deleteIngredient was called with the correct ID
    expect(ingredientService.deleteIngredient).toHaveBeenCalledWith("1");

    // Verify toast was displayed
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Success",
        description: "Ingredient removed from fridge",
      });
    });
  });

  it("handles error during ingredient deletion", async () => {
    // Mock the deleteIngredient function to reject with an error
    (ingredientService.deleteIngredient as jest.Mock).mockRejectedValue(
      new Error("API error")
    );

    render(<FridgePage />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByText("Eggs")).toBeInTheDocument();
    });

    // Find and click the delete button for the first ingredient
    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });
    fireEvent.click(deleteButtons[0]);

    // Find and click the confirm button
    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    });
    fireEvent.click(confirmButton);

    // Verify deleteIngredient was called
    expect(ingredientService.deleteIngredient).toHaveBeenCalledWith("1");

    // Verify error toast was displayed
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    });
  });

  it("displays empty state when no ingredients are available", async () => {
    // Mock fetch to return empty array
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<FridgePage />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByText("Your fridge is empty")).toBeInTheDocument();
      expect(
        screen.getByText("Add some ingredients to get started")
      ).toBeInTheDocument();
    });

    // Verify "Add Your First Ingredient" button is present
    expect(
      screen.getByRole("button", { name: /add your first ingredient/i })
    ).toBeInTheDocument();
  });

  it("handles API error when loading ingredients", async () => {
    // Mock fetch to return an error that will trigger the catch block
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Failed to load data")
    );

    render(<FridgePage />);

    // Wait for error handling
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    });
  });
});
