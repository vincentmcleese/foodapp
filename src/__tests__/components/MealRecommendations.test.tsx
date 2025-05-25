import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MealRecommendationList } from "@/components/features/meals/MealRecommendationList";
import { mealService } from "@/lib/api-services";

// Mock API services
jest.mock("@/lib/api-services", () => ({
  mealService: {
    getRecommendations: jest.fn(),
    saveMeal: jest.fn(),
  },
}));

describe("MealRecommendationList", () => {
  const mockRecommendations = [
    {
      id: "rec1",
      name: "Grilled Chicken Salad",
      description: "A healthy grilled chicken salad with fresh vegetables",
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      cuisine: "Mediterranean",
      ingredients: [
        { name: "Chicken Breast", quantity: 200, unit: "g" },
        { name: "Lettuce", quantity: 100, unit: "g" },
      ],
      nutrition: {
        calories: 350,
        protein: 35,
        carbs: 10,
        fat: 20,
      },
    },
    {
      id: "rec2",
      name: "Vegetable Stir Fry",
      description: "Quick and easy vegetable stir fry",
      prepTime: 10,
      cookTime: 10,
      servings: 2,
      cuisine: "Asian",
      ingredients: [
        { name: "Bell Pepper", quantity: 1, unit: "whole" },
        { name: "Broccoli", quantity: 200, unit: "g" },
        { name: "Carrot", quantity: 1, unit: "whole" },
      ],
      nutrition: {
        calories: 250,
        protein: 8,
        carbs: 30,
        fat: 12,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (mealService.getRecommendations as jest.Mock).mockResolvedValue(
      mockRecommendations
    );
    (mealService.saveMeal as jest.Mock).mockResolvedValue({
      success: true,
      mealId: "new-meal-id",
    });
  });

  it("should display recommendation cards", async () => {
    // Render component with initial recommendations
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Check recommendations are displayed
    expect(screen.getByText("Grilled Chicken Salad")).toBeInTheDocument();
    expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();

    // Check nutrition information is displayed
    expect(screen.getByText("350 kcal")).toBeInTheDocument();
    expect(screen.getByText("250 kcal")).toBeInTheDocument();

    // Check ingredients are displayed
    expect(screen.getByText("Chicken Breast")).toBeInTheDocument();
    expect(screen.getByText("Lettuce")).toBeInTheDocument();
    expect(screen.getByText("Bell Pepper")).toBeInTheDocument();
  });

  it("should handle filtering", async () => {
    // Render component
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Filter by cuisine
    const cuisineFilter = screen.getByLabelText("Cuisine");
    fireEvent.change(cuisineFilter, { target: { value: "Asian" } });

    // Asian cuisine meal should remain visible, Mediterranean should be hidden
    await waitFor(() => {
      expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
      expect(
        screen.queryByText("Grilled Chicken Salad")
      ).not.toBeInTheDocument();
    });

    // Reset filter
    fireEvent.change(cuisineFilter, { target: { value: "" } });

    // Both meals should be visible again
    await waitFor(() => {
      expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
      expect(screen.getByText("Grilled Chicken Salad")).toBeInTheDocument();
    });
  });

  it("should implement load more functionality", async () => {
    // Mock additional recommendations for "load more"
    const additionalRecommendations = [
      {
        id: "rec3",
        name: "Salmon with Roasted Vegetables",
        description: "Healthy salmon dish with seasonal vegetables",
        prepTime: 20,
        cookTime: 25,
        servings: 2,
        cuisine: "Nordic",
        ingredients: [
          { name: "Salmon Fillet", quantity: 300, unit: "g" },
          { name: "Asparagus", quantity: 200, unit: "g" },
        ],
        nutrition: {
          calories: 450,
          protein: 40,
          carbs: 15,
          fat: 25,
        },
      },
    ];

    // Mock getRecommendations to return additional recommendations on second call
    (mealService.getRecommendations as jest.Mock)
      .mockResolvedValueOnce(mockRecommendations)
      .mockResolvedValueOnce(additionalRecommendations);

    // Render component
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Initially only the first set of recommendations should be visible
    expect(screen.getByText("Grilled Chicken Salad")).toBeInTheDocument();
    expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
    expect(
      screen.queryByText("Salmon with Roasted Vegetables")
    ).not.toBeInTheDocument();

    // Click "Load More" button
    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    // After loading more, the additional recommendation should be visible
    await waitFor(() => {
      expect(
        screen.getByText("Salmon with Roasted Vegetables")
      ).toBeInTheDocument();
    });

    // Verify API was called with the correct page
    expect(mealService.getRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
      })
    );
  });

  it("should allow saving recommendations", async () => {
    // Render component
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Find save button for first recommendation
    const saveButtons = screen.getAllByText("Save to My Meals");
    fireEvent.click(saveButtons[0]);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText("Meal saved successfully!")).toBeInTheDocument();
    });

    // Verify API was called with the correct meal data
    expect(mealService.saveMeal).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Grilled Chicken Salad",
      })
    );
  });
});
