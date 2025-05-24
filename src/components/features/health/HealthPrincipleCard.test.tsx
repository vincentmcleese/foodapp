import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HealthPrincipleCard } from "./HealthPrincipleCard";
import { healthService, HealthPrinciple } from "@/lib/api-services";
import { toast } from "sonner";

// Mock the health service and toast
jest.mock("@/lib/api-services", () => ({
  healthService: {
    togglePrinciple: jest.fn(),
    deletePrinciple: jest.fn(),
  },
  HealthPrinciple: {},
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("HealthPrincipleCard", () => {
  const mockPrinciple: HealthPrinciple = {
    id: "1",
    name: "Avoid Ultra-Processed Foods",
    description: "Minimize consumption of foods with artificial additives",
    enabled: true,
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the principle card correctly", () => {
    render(
      <HealthPrincipleCard
        principle={mockPrinciple}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Avoid Ultra-Processed Foods")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Minimize consumption of foods with artificial additives"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Enabled")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles the principle when the switch is clicked", async () => {
    const updatedPrinciple = {
      ...mockPrinciple,
      enabled: false,
    };

    // Mock the togglePrinciple to return the updated principle
    (healthService.togglePrinciple as jest.Mock).mockResolvedValue(
      updatedPrinciple
    );

    render(
      <HealthPrincipleCard
        principle={mockPrinciple}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    // Click the switch
    fireEvent.click(screen.getByRole("switch"));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(healthService.togglePrinciple).toHaveBeenCalledWith(
        mockPrinciple.id,
        false
      );
      expect(mockOnToggle).toHaveBeenCalledWith(updatedPrinciple);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("deletes the principle when the delete button is clicked", async () => {
    (healthService.deletePrinciple as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(
      <HealthPrincipleCard
        principle={mockPrinciple}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    // Click the delete button
    fireEvent.click(screen.getByLabelText(`Delete ${mockPrinciple.name}`));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(healthService.deletePrinciple).toHaveBeenCalledWith(
        mockPrinciple.id
      );
      expect(mockOnDelete).toHaveBeenCalledWith(mockPrinciple.id);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("handles errors when toggling fails", async () => {
    (healthService.togglePrinciple as jest.Mock).mockRejectedValue(
      new Error("Failed to toggle")
    );

    render(
      <HealthPrincipleCard
        principle={mockPrinciple}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    // Click the switch
    fireEvent.click(screen.getByRole("switch"));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to toggle principle");
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });
});
