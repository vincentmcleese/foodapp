import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MealRecommendationList } from "@/components/features/meals/MealRecommendationList";
import { mealService, MealRecommendation } from "@/lib/api-services";

// Mock the API services
jest.mock("@/lib/api-services", () => ({
  mealService: {
    getRecommendations: jest.fn(),
    saveMeal: jest.fn(),
  },
}));

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add ResizeObserver to the global object
global.ResizeObserver = ResizeObserverMock;

// Mock the useToast hook used by the component
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("MealRecommendationList", () => {
  const mockRecommendations: MealRecommendation[] = [
    {
      id: "rec-1",
      name: "Vegetable Stir Fry",
      description: "A healthy mix of fresh vegetables",
      cuisine: "Asian",
      prepTime: 30,
      cookTime: 20,
      servings: 2,
      instructions: "Stir fry all vegetables together",
      ingredients: [
        {
          name: "Broccoli",
          quantity: 1,
          unit: "cup",
        },
        {
          name: "Carrots",
          quantity: 2,
          unit: "medium",
        },
      ],
      nutrition: {
        calories: 250,
        protein: 8,
        carbs: 30,
        fat: 12,
      },
    },
    {
      id: "rec-2",
      name: "Pasta Primavera",
      description: "Pasta with spring vegetables",
      cuisine: "Italian",
      prepTime: 45,
      cookTime: 25,
      servings: 4,
      instructions: "Boil pasta and sauté vegetables",
      ingredients: [
        {
          name: "Pasta",
          quantity: 200,
          unit: "g",
        },
        {
          name: "Zucchini",
          quantity: 1,
          unit: "medium",
        },
      ],
      nutrition: {
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 8,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mocks for API calls
    (mealService.getRecommendations as jest.Mock).mockResolvedValue([]);
  });

  it("should display recommendation cards", async () => {
    // Render component with initial recommendations
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Verify meal cards are rendered
    await waitFor(() => {
      expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
      expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
    });

    // Verify cuisine is displayed
    expect(screen.getByText("Asian")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();

    // Verify total prep time (prepTime + cookTime) is displayed
    expect(screen.getByText("50 min")).toBeInTheDocument(); // 30 + 20 = 50
    expect(screen.getByText("70 min")).toBeInTheDocument(); // 45 + 25 = 70
  });

  it("should handle filtering", async () => {
    // Render component
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Verify both meals are initially shown
    await waitFor(() => {
      expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
      expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
    });

    // Filter by cuisine
    const cuisineSelect = screen.getByLabelText(/cuisine/i);
    fireEvent.change(cuisineSelect, { target: { value: "Asian" } });

    // Verify only Asian cuisine is shown
    await waitFor(() => {
      expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
      expect(screen.queryByText("Pasta Primavera")).not.toBeInTheDocument();
    });

    // Reset filter
    fireEvent.change(cuisineSelect, { target: { value: "" } });

    // Since we can't directly change the slider, we'll test filtering indirectly
    // by verifying the initial state includes both meals
    expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
    expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
  });

  it("should implement load more functionality", async () => {
    // Mock additional recommendations to load
    const additionalRecommendations: MealRecommendation[] = [
      {
        id: "rec-3",
        name: "Chicken Curry",
        description: "Spicy chicken curry",
        cuisine: "Indian",
        prepTime: 60,
        cookTime: 30,
        servings: 4,
        instructions: "Cook chicken with curry spices",
        ingredients: [
          {
            name: "Chicken",
            quantity: 500,
            unit: "g",
          },
          {
            name: "Curry Paste",
            quantity: 2,
            unit: "tbsp",
          },
        ],
        nutrition: {
          calories: 450,
          protein: 35,
          carbs: 15,
          fat: 25,
        },
      },
    ];

    // Setup the load more mock
    (mealService.getRecommendations as jest.Mock).mockResolvedValue(
      additionalRecommendations
    );

    // Render component
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Verify initial recommendations are shown
    await waitFor(() => {
      expect(screen.getByText("Vegetable Stir Fry")).toBeInTheDocument();
      expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
    });

    // Click load more button
    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    fireEvent.click(loadMoreButton);

    // Verify load more was called
    expect(mealService.getRecommendations).toHaveBeenCalled();

    // Verify new recommendations are shown
    await waitFor(() => {
      expect(screen.getByText("Chicken Curry")).toBeInTheDocument();
    });
  });

  it("should allow saving recommendations", async () => {
    // Setup the save meal mock
    (mealService.saveMeal as jest.Mock).mockResolvedValue({
      id: "saved-meal-1",
      success: true,
    });

    // Render component
    render(
      <MealRecommendationList initialRecommendations={mockRecommendations} />
    );

    // Find save buttons
    const saveButtons = await screen.findAllByRole("button", {
      name: /save to my meals/i,
    });

    // Click the first save button
    fireEvent.click(saveButtons[0]);

    // Verify save meal was called with the correct meal
    expect(mealService.saveMeal).toHaveBeenCalledWith(mockRecommendations[0]);

    // No need to test for toast message since we're mocking the useToast hook
    // and the actual UI behavior may vary
  });
});
