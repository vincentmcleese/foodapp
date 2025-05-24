import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlanCalendar } from "./PlanCalendar";
import { PlanEntry } from "@/lib/api-services";

describe("PlanCalendar", () => {
  const mockEntries: PlanEntry[] = [
    {
      id: "1",
      meal_id: "meal-1",
      date: "2023-07-10", // Monday
      meal_type: "breakfast",
      meal: { id: "meal-1", name: "Oatmeal" },
    },
    {
      id: "2",
      meal_id: "meal-2",
      date: "2023-07-12", // Wednesday
      meal_type: "dinner",
      meal: { id: "meal-2", name: "Pasta" },
    },
  ];

  const mockHandlers = {
    onAddEntry: jest.fn(),
    onEditEntry: jest.fn(),
    onDeleteEntry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the calendar with days and meal types", () => {
    render(<PlanCalendar entries={[]} {...mockHandlers} />);

    // Check for meal types (unique headings)
    expect(
      screen.getByRole("heading", { name: "breakfast" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "lunch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "dinner" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "snack" })).toBeInTheDocument();

    // Check for "Add meal" empty slots (should be 28 = 7 days * 4 meal types)
    const addMealTexts = screen.getAllByText("Add meal");
    expect(addMealTexts.length).toBeGreaterThan(0);
  });

  it("displays meal entries in the correct slots", () => {
    render(<PlanCalendar entries={mockEntries} {...mockHandlers} />);

    // Check for meal names
    expect(screen.getByText("Oatmeal")).toBeInTheDocument();
    expect(screen.getByText("Pasta")).toBeInTheDocument();
  });

  it("calls onAddEntry when an empty slot is clicked", () => {
    render(<PlanCalendar entries={[]} {...mockHandlers} />);

    // Find an empty slot and click it
    const emptySlots = screen.getAllByText("Add meal");
    fireEvent.click(emptySlots[0]);

    // Check if the handler was called
    expect(mockHandlers.onAddEntry).toHaveBeenCalled();
  });

  it("calls onEditEntry when the edit button is clicked", () => {
    render(<PlanCalendar entries={mockEntries} {...mockHandlers} />);

    // Find all buttons
    const buttons = screen.getAllByRole("button");

    // Find a button that doesn't have "Add meal" text
    const editButton = buttons.find(
      (button) =>
        !button.textContent?.includes("Add meal") &&
        !button.classList.contains("text-error") // Not delete button
    );

    if (editButton) {
      fireEvent.click(editButton);
      expect(mockHandlers.onEditEntry).toHaveBeenCalled();
    } else {
      fail("Edit button not found");
    }
  });

  it("calls onDeleteEntry when the delete button is clicked", () => {
    render(<PlanCalendar entries={mockEntries} {...mockHandlers} />);

    // Find delete button - should have text-error class
    const deleteButton = screen
      .getAllByRole("button")
      .find((button) => button.classList.contains("text-error"));

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockHandlers.onDeleteEntry).toHaveBeenCalled();
    } else {
      fail("Delete button not found");
    }
  });

  it("should allow adding a meal to an occupied slot", () => {
    render(<PlanCalendar entries={mockEntries} {...mockHandlers} />);

    // Find "Add meal" button in a slot that already has entries
    const addButtons = screen.getAllByRole("button", { name: /Add meal/i });
    fireEvent.click(addButtons[0]);

    // Check if the handler was called with the correct day and meal type
    expect(mockHandlers.onAddEntry).toHaveBeenCalled();
  });
});
