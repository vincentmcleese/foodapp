import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { MealRating } from "@/components/features/meals/MealRating";
import { mealService } from "@/lib/api-services";
import { toast } from "sonner";

// Mock react-confetti
jest.mock("react-confetti", () => ({
  __esModule: true,
  default: () => <div data-testid="confetti-animation" />,
}));

// Mock the hooks
jest.mock("@/hooks/useWindowSize", () => ({
  useWindowSize: () => ({ width: 1000, height: 800 }),
}));

// Mock the meal service
jest.mock("@/lib/api-services", () => ({
  mealService: {
    rateMeal: jest.fn(),
  },
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("MealRating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the compact variant correctly", () => {
    const initialRatings = { likes: 5, dislikes: 2, total: 7 };
    render(
      <MealRating
        mealId="meal-123"
        initialRatings={initialRatings}
        variant="compact"
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders the full variant correctly", () => {
    const initialRatings = { likes: 10, dislikes: 3, total: 13 };
    render(<MealRating mealId="meal-123" initialRatings={initialRatings} />);

    expect(screen.getByText("Rate this meal")).toBeInTheDocument();
    expect(screen.getByText("Like (10)")).toBeInTheDocument();
    expect(screen.getByText("Dislike (3)")).toBeInTheDocument();
    expect(screen.getByText("13 ratings")).toBeInTheDocument();
  });

  it("submits a like rating and shows confetti", async () => {
    // Mock successful rating
    (mealService.rateMeal as jest.Mock).mockResolvedValue({
      id: "rating-123",
      meal_id: "meal-123",
      rating: true,
    });

    const initialRatings = { likes: 5, dislikes: 2, total: 7 };
    const handleRatingChange = jest.fn();

    render(
      <MealRating
        mealId="meal-123"
        initialRatings={initialRatings}
        onRatingChange={handleRatingChange}
      />
    );

    // Click the like button
    fireEvent.click(screen.getByText("Like (5)"));

    // Verify the service was called
    expect(mealService.rateMeal).toHaveBeenCalledWith("meal-123", true);

    // Wait for the async operations
    await waitFor(() => {
      // Check that toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        "Thanks for liking this meal!"
      );

      // Check that confetti was displayed
      expect(screen.getByTestId("confetti-animation")).toBeInTheDocument();

      // Check that the rating count was updated
      expect(screen.getByText("Like (6)")).toBeInTheDocument();

      // Check that the callback was called with updated ratings
      expect(handleRatingChange).toHaveBeenCalledWith({
        likes: 6,
        dislikes: 2,
        total: 8,
        userRating: true,
      });
    });
  });

  it("submits a dislike rating without confetti", async () => {
    // Mock successful rating
    (mealService.rateMeal as jest.Mock).mockResolvedValue({
      id: "rating-123",
      meal_id: "meal-123",
      rating: false,
    });

    const initialRatings = { likes: 5, dislikes: 2, total: 7 };
    const handleRatingChange = jest.fn();

    render(
      <MealRating
        mealId="meal-123"
        initialRatings={initialRatings}
        onRatingChange={handleRatingChange}
      />
    );

    // Click the dislike button
    fireEvent.click(screen.getByText("Dislike (2)"));

    // Verify the service was called
    expect(mealService.rateMeal).toHaveBeenCalledWith("meal-123", false);

    // Wait for the async operations
    await waitFor(() => {
      // Check that toast was shown
      expect(toast.success).toHaveBeenCalledWith("Thanks for your feedback!");

      // Check that confetti was NOT displayed (no confetti for dislikes)
      expect(
        screen.queryByTestId("confetti-animation")
      ).not.toBeInTheDocument();

      // Check that the rating count was updated
      expect(screen.getByText("Dislike (3)")).toBeInTheDocument();

      // Check that the callback was called with updated ratings
      expect(handleRatingChange).toHaveBeenCalledWith({
        likes: 5,
        dislikes: 3,
        total: 8,
        userRating: false,
      });
    });
  });

  it("handles errors gracefully", async () => {
    // Mock a failed rating
    (mealService.rateMeal as jest.Mock).mockRejectedValue(
      new Error("Rating failed")
    );

    render(<MealRating mealId="meal-123" />);

    // Click the like button
    fireEvent.click(screen.getByText("Like (0)"));

    // Wait for the async operations
    await waitFor(() => {
      // Check that error toast was shown
      expect(toast.error).toHaveBeenCalledWith("Failed to submit rating");
    });
  });
});
