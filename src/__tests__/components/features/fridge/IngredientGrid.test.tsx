import { render, screen, fireEvent } from "@testing-library/react";
import { IngredientGrid } from "@/components/features/fridge/IngredientGrid";
import { Ingredient } from "@/lib/api-services";

// Mock the Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("IngredientGrid", () => {
  const mockIngredients: Ingredient[] = [
    {
      id: "1",
      name: "Eggs",
      image_url: "https://example.com/eggs.jpg",
    },
    {
      id: "2",
      name: "Milk",
      image_url: "https://example.com/milk.jpg",
    },
  ];

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a grid of ingredients", () => {
    render(
      <IngredientGrid
        ingredients={mockIngredients}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    // Check if all ingredients are rendered
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();

    // Check if images are rendered
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute(
      "src",
      expect.stringContaining("eggs.jpg")
    );
    expect(images[1]).toHaveAttribute(
      "src",
      expect.stringContaining("milk.jpg")
    );
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <IngredientGrid
        ingredients={mockIngredients}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    // Find and click the first edit button
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Verify onEdit was called with the correct ingredient
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockIngredients[0]);
  });

  it("calls onDelete when delete button is clicked and confirmed", () => {
    render(
      <IngredientGrid
        ingredients={mockIngredients}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    // Find and click the first delete button
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Find and click the confirm button
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Verify onDelete was called with the correct ingredient ID
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockIngredients[0].id);
  });

  it("does not call onDelete when delete is canceled", () => {
    render(
      <IngredientGrid
        ingredients={mockIngredients}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    // Find and click the first delete button
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Find and click the cancel button
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Verify onDelete was not called
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });

  it("renders empty state when no ingredients are provided", () => {
    render(
      <IngredientGrid
        ingredients={[]}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText(/no ingredients/i)).toBeInTheDocument();
  });
});
