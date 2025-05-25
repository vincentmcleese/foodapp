import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renders with default size (md)", () => {
    render(<Spinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("h-6 w-6"); // md size
  });

  it("renders with small size", () => {
    render(<Spinner size="sm" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-4 w-4"); // sm size
  });

  it("renders with large size", () => {
    render(<Spinner size="lg" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-8 w-8"); // lg size
  });

  it("renders with extra large size", () => {
    render(<Spinner size="xl" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-12 w-12"); // xl size
  });

  it("applies custom className", () => {
    render(<Spinner className="text-primary bg-secondary" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("text-primary");
    expect(spinner).toHaveClass("bg-secondary");
  });
});
