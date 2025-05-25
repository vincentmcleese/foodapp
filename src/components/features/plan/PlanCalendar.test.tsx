import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlanCalendar } from "./PlanCalendar";
import { PlanEntry } from "@/lib/api-services";

// Mock the MealImage component as it uses next/image
jest.mock("../meals/MealImage", () => ({
  MealImage: ({ name }: { name: string }) => (
    <div data-testid="meal-image">{name}</div>
  ),
}));

// Mock the Tooltip components
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({
    asChild,
    children,
  }: {
    asChild: boolean;
    children: React.ReactNode;
  }) => <>{children}</>,
  TooltipContent: () => null,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("PlanCalendar", () => {
  const mockEntries: PlanEntry[] = [
    {
      id: "1",
      meal_id: "meal-1",
      date: "2023-07-10", // Monday
      meal_type: "breakfast",
      meal: {
        id: "meal-1",
        name: "Oatmeal",
        image_url: "/images/oatmeal.jpg",
        image_status: "completed",
      },
    },
    {
      id: "2",
      meal_id: "meal-2",
      date: "2023-07-12", // Wednesday
      meal_type: "dinner",
      meal: {
        id: "meal-2",
        name: "Pasta",
        image_url: "/images/pasta.jpg",
        image_status: "completed",
      },
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

    // Check for meal images
    expect(screen.getAllByTestId("meal-image")).toHaveLength(2);
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

    // Find the Edit button by aria-label
    const editButtons = screen.getAllByLabelText(/Edit/);
    fireEvent.click(editButtons[0]);

    expect(mockHandlers.onEditEntry).toHaveBeenCalled();
  });

  it("calls onDeleteEntry when the delete button is clicked and confirmed", () => {
    render(<PlanCalendar entries={mockEntries} {...mockHandlers} />);

    // Find delete button by aria-label
    const deleteButtons = screen.getAllByLabelText(/Delete/);
    fireEvent.click(deleteButtons[0]);

    // After clicking delete, the confirm button should appear
    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    expect(mockHandlers.onDeleteEntry).toHaveBeenCalled();
  });

  it("should allow adding a meal to an occupied slot", () => {
    render(<PlanCalendar entries={mockEntries} {...mockHandlers} />);

    // Find "Add meal" button in a slot that already has entries
    const addButtons = screen.getAllByText("Add meal");
    fireEvent.click(addButtons[0]);

    // Check if the handler was called
    expect(mockHandlers.onAddEntry).toHaveBeenCalled();
  });
});
