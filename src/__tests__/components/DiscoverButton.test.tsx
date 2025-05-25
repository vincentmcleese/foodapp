import { render, screen, fireEvent } from "@testing-library/react";
import { DiscoverButton } from "@/components/features/meals/DiscoverButton";
import { useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("DiscoverButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    // Mock router
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    // Render component
    render(<DiscoverButton />);

    // Check button rendering
    const button = screen.getByText("Discover New Meals");
    expect(button).toBeInTheDocument();

    // Should have a discovery icon
    const icon = screen.getByTestId("discover-icon");
    expect(icon).toBeInTheDocument();
  });

  it("should navigate to discover page on click", () => {
    // Mock router
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    // Render component
    render(<DiscoverButton />);

    // Click button
    const button = screen.getByText("Discover New Meals");
    fireEvent.click(button);

    // Check navigation
    expect(pushMock).toHaveBeenCalledWith("/meals/discover");
  });
});
