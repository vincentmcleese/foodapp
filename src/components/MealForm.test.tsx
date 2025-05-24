import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MealForm } from "@/components/features/meals/MealForm";

// Mock the router
const pushMock = jest.fn();
const refreshMock = jest.fn();
const backMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    back: backMock,
  }),
}));

// Mock ingredientService and mealService
jest.mock("@/lib/api-services", () => ({
  ingredientService: {
    getAllIngredients: jest.fn().mockResolvedValue([
      { id: "ing-1", name: "Tomato" },
      { id: "ing-2", name: "Onion" },
    ]),
  },
  mealService: {
    createMeal: jest.fn().mockResolvedValue({ id: "new-meal" }),
    updateMeal: jest.fn().mockResolvedValue({ success: true }),
    addIngredientToMeal: jest.fn().mockResolvedValue({ success: true }),
    removeIngredientFromMeal: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe("MealForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a form with the correct fields for new meal", async () => {
    render(<MealForm />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Meal Name/i)).toBeInTheDocument();
    });

    // Check form fields
    expect(screen.getByLabelText(/Meal Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instructions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prep Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cook Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image URL/i)).toBeInTheDocument();

    // Check ingredient section
    expect(screen.getByText(/Ingredients/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Ingredient/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Meal/i })
    ).toBeInTheDocument();
  });

  it("prepopulates fields when editing an existing meal", async () => {
    const mockMeal = {
      id: "meal-123",
      name: "Pasta Primavera",
      description: "Light and fresh pasta dish",
      instructions: "Cook pasta, add vegetables",
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      image_url: "https://example.com/pasta.jpg",
      ingredients: [
        {
          id: "mi-1",
          meal_id: "meal-123",
          ingredient_id: "ing-1",
          quantity: 2,
          unit: "pcs",
          ingredient: { id: "ing-1", name: "Tomato" },
        },
      ],
    };

    render(<MealForm meal={mockMeal} isEditing={true} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Pasta Primavera")).toBeInTheDocument();
    });

    // Check form fields are populated
    expect(screen.getByDisplayValue("Pasta Primavera")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Light and fresh pasta dish")
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Cook pasta, add vegetables")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("https://example.com/pasta.jpg")
    ).toBeInTheDocument();

    // Check ingredients list
    expect(screen.getByText(/Current Ingredients/i)).toBeInTheDocument();
    expect(screen.getByText(/2 pcs of/i)).toBeInTheDocument();
    expect(screen.getByText(/Tomato/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update Meal/i })
    ).toBeInTheDocument();
  });

  it("allows adding ingredients to the form", async () => {
    render(<MealForm />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
    });

    // Fill in ingredient form
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: "3" },
    });

    // Click add ingredient button
    const addButton = screen.getByRole("button", { name: /Add Ingredient/i });
    fireEvent.click(addButton);

    // Should show error since not all fields are filled
    expect(
      screen.getByText(/Please fill in all ingredient fields/i)
    ).toBeInTheDocument();

    // Fill in all fields
    fireEvent.change(screen.getByLabelText(/Ingredient/i).closest("select")!, {
      target: { value: "ing-1" },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: "3" },
    });

    // Click add ingredient button again
    fireEvent.click(addButton);

    // Now the ingredient should be added to the list
    await waitFor(() => {
      expect(screen.getByText(/3 g of/i)).toBeInTheDocument();
      expect(screen.getByText(/Tomato/i)).toBeInTheDocument();
    });

    // Should have a remove button
    expect(screen.getByRole("button", { name: /Remove/i })).toBeInTheDocument();
  });

  it("allows removing ingredients from the form", async () => {
    const mockMeal = {
      id: "meal-123",
      name: "Pasta Primavera",
      ingredients: [
        {
          id: "mi-1",
          meal_id: "meal-123",
          ingredient_id: "ing-1",
          quantity: 2,
          unit: "pcs",
          ingredient: { id: "ing-1", name: "Tomato" },
        },
      ],
    };

    render(<MealForm meal={mockMeal} isEditing={true} />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByText(/Current Ingredients/i)).toBeInTheDocument();
    });

    // Check that ingredient is in the list
    expect(screen.getByText(/2 pcs of/i)).toBeInTheDocument();
    expect(screen.getByText(/Tomato/i)).toBeInTheDocument();

    // Click remove button
    const removeButton = screen.getByRole("button", { name: /Remove/i });
    fireEvent.click(removeButton);

    // Ingredient should be removed
    expect(screen.queryByText(/2 pcs of/i)).not.toBeInTheDocument();
  });

  it("creates a new meal when form is submitted", async () => {
    const { mealService } = require("@/lib/api-services");

    render(<MealForm />);

    // Wait for ingredients to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Meal Name/i)).toBeInTheDocument();
    });

    // Fill in form
    fireEvent.change(screen.getByLabelText(/Meal Name/i), {
      target: { value: "New Test Meal" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test description" },
    });

    // Add an ingredient
    fireEvent.change(screen.getByLabelText(/Ingredient/i).closest("select")!, {
      target: { value: "ing-1" },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: "3" },
    });

    const addButton = screen.getByRole("button", { name: /Add Ingredient/i });
    fireEvent.click(addButton);

    // Wait for ingredient to be added
    await waitFor(() => {
      expect(screen.getByText(/3 g of/i)).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /Create Meal/i });
    fireEvent.click(submitButton);

    // Check if the service was called
    await waitFor(() => {
      expect(mealService.createMeal).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Test Meal",
          description: "Test description",
          ingredients: expect.arrayContaining([
            expect.objectContaining({
              ingredient_id: "ing-1",
              quantity: 3,
              unit: "g",
            }),
          ]),
        })
      );
    });

    // Check if we navigated away
    expect(pushMock).toHaveBeenCalledWith("/meals");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("updates an existing meal when form is submitted in edit mode", async () => {
    const { mealService } = require("@/lib/api-services");

    const mockMeal = {
      id: "meal-123",
      name: "Pasta Primavera",
      description: "Light and fresh pasta dish",
      ingredients: [
        {
          id: "mi-1",
          meal_id: "meal-123",
          ingredient_id: "ing-1",
          quantity: 2,
          unit: "pcs",
          ingredient: { id: "ing-1", name: "Tomato" },
        },
      ],
    };

    render(<MealForm meal={mockMeal} isEditing={true} />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Pasta Primavera")).toBeInTheDocument();
    });

    // Update name
    fireEvent.change(screen.getByLabelText(/Meal Name/i), {
      target: { value: "Updated Pasta" },
    });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /Update Meal/i });
    fireEvent.click(submitButton);

    // Check if the service was called
    await waitFor(() => {
      expect(mealService.updateMeal).toHaveBeenCalledWith(
        "meal-123",
        expect.objectContaining({
          name: "Updated Pasta",
          description: "Light and fresh pasta dish",
        })
      );
    });

    // Check if we navigated away
    expect(pushMock).toHaveBeenCalledWith("/meals");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("handles validation and prevents submission with empty name", async () => {
    render(<MealForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Meal Name/i)).toBeInTheDocument();
    });

    // Leave name empty but add an ingredient
    fireEvent.change(screen.getByLabelText(/Ingredient/i).closest("select")!, {
      target: { value: "ing-1" },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: "3" },
    });

    const addButton = screen.getByRole("button", { name: /Add Ingredient/i });
    fireEvent.click(addButton);

    // Wait for ingredient to be added
    await waitFor(() => {
      expect(screen.getByText(/3 g of/i)).toBeInTheDocument();
    });

    // Try to submit form
    const submitButton = screen.getByRole("button", { name: /Create Meal/i });
    fireEvent.click(submitButton);

    // Should show validation error
    expect(screen.getByText(/Please enter a meal name/i)).toBeInTheDocument();

    // The mealService should not have been called
    const { mealService } = require("@/lib/api-services");
    expect(mealService.createMeal).not.toHaveBeenCalled();
  });

  it("navigates back when cancel button is clicked", async () => {
    render(<MealForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Meal Name/i)).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Should call router.back()
    expect(backMock).toHaveBeenCalled();
  });
});
