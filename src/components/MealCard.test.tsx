import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import MealCard from "./MealCard";
import { Meal } from "@/lib/api-services";
import { mealService } from "@/lib/api-services";

// Mock push function
const pushMock = jest.fn();

// Mock the router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock the mealService
jest.mock("@/lib/api-services", () => ({
  mealService: {
    deleteMeal: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ success: true })),
  },
}));

describe("MealCard", () => {
  const mockMeal = {
    id: "123",
    name: "Spaghetti Bolognese",
    description: "Classic Italian pasta dish",
    nutrition: {
      calories: 450,
      protein: 25,
      carbs: 60,
      fat: 15,
    },
    prep_time: 15,
    cook_time: 30,
    servings: 4,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders meal information correctly", () => {
    render(<MealCard meal={mockMeal} />);

    // Check if basic meal information is displayed
    expect(screen.getByText("Spaghetti Bolognese")).toBeInTheDocument();
    expect(screen.getByText("Classic Italian pasta dish")).toBeInTheDocument();

    // Check if nutrition information is displayed
    expect(screen.getByText("450 kcal")).toBeInTheDocument();
    expect(screen.getByText("25g")).toBeInTheDocument();
    expect(screen.getByText("60g")).toBeInTheDocument();
    expect(screen.getByText("15g")).toBeInTheDocument();

    // Check if the correct labels are displayed
    expect(screen.getByText("Calories")).toBeInTheDocument();
    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.getByText("Carbs")).toBeInTheDocument();
    expect(screen.getByText("Fat")).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("navigates to edit page when edit button is clicked", () => {
    render(<MealCard meal={mockMeal} />);
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(pushMock).toHaveBeenCalledWith(`/meals/123`);
  });

  it("shows confirmation dialog when delete button is clicked", () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(false);

    render(<MealCard meal={mockMeal} />);
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this meal?"
    );

    // Clean up
    window.confirm = originalConfirm;
  });

  it("calls delete API when confirmation is accepted", async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(true);

    // Mock delete function
    const { mealService } = require("@/lib/api-services");

    render(<MealCard meal={mockMeal} />);
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mealService.deleteMeal).toHaveBeenCalledWith("123");

    // Clean up
    window.confirm = originalConfirm;
  });

  it("calls onDelete callback after successful deletion", async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(true);

    const onDeleteMock = jest.fn();

    render(<MealCard meal={mockMeal} onDelete={onDeleteMock} />);
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    // Wait for the async deletion to complete
    await new Promise(process.nextTick);

    expect(onDeleteMock).toHaveBeenCalled();

    // Clean up
    window.confirm = originalConfirm;
  });

  it("shows image when image_url is provided", () => {
    const mealWithImage = {
      ...mockMeal,
      image_url: "https://example.com/image.jpg",
    };

    render(<MealCard meal={mealWithImage} />);

    const imageDiv = document.querySelector(".bg-cover.bg-center");
    expect(imageDiv).toBeInTheDocument();
    expect(imageDiv).toHaveStyle(
      "background-image: url(https://example.com/image.jpg)"
    );
  });

  it("shows loading state when deleting", async () => {
    // Make deleteMeal not resolve immediately
    let resolveDelete: (value: unknown) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });
    (mealService.deleteMeal as jest.Mock).mockReturnValue(deletePromise);

    render(<MealCard meal={mockMeal} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Deleting...")).toBeInTheDocument();

    // Resolve the delete promise
    resolveDelete!({ success: true });

    await new Promise(process.nextTick);

    expect(screen.queryByText("Deleting...")).not.toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
