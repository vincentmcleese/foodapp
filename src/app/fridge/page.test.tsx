import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FridgePage from "./page";

describe("FridgePage UI", () => {
  it("can add, edit, and delete an ingredient", () => {
    render(<FridgePage />);
    // Add
    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Milk" },
    });
    fireEvent.change(screen.getByPlaceholderText(/quantity/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText(/unit/i), {
      target: { value: "L" },
    });
    fireEvent.click(screen.getByText(/add/i));
    expect(screen.getByText(/milk/i)).toBeInTheDocument();
    // Edit
    fireEvent.click(screen.getByText(/edit/i));
    fireEvent.change(screen.getByPlaceholderText(/quantity/i), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByText(/save/i));
    expect(screen.getByText("3")).toBeInTheDocument();
    // Delete
    fireEvent.click(screen.getByText(/delete/i));
    expect(screen.queryByText(/milk/i)).not.toBeInTheDocument();
  });
});
