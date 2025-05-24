import React from "react";
import { render, screen } from "@testing-library/react";
import { ShoppingItemCard } from "@/components/features/shopping/ShoppingItemCard";
import { ShoppingItem } from "@/lib/api-services";

describe("ShoppingItemCard", () => {
  it('should render an item with "need-to-buy" status', () => {
    const item: ShoppingItem = {
      id: "1",
      name: "Tomatoes",
      required: 500,
      unit: "g",
      inStock: 0,
      status: "need-to-buy",
    };

    render(<ShoppingItemCard item={item} />);

    expect(screen.getByText("Tomatoes")).toBeInTheDocument();
    expect(screen.getByText("500 g needed")).toBeInTheDocument();
    expect(screen.getByText("Need to Buy")).toBeInTheDocument();
  });

  it('should render an item with "partial" status', () => {
    const item: ShoppingItem = {
      id: "2",
      name: "Chicken",
      required: 1000,
      unit: "g",
      inStock: 400,
      status: "partial",
    };

    render(<ShoppingItemCard item={item} />);

    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(
      screen.getByText("1000 g needed (400 g in fridge)")
    ).toBeInTheDocument();
    expect(screen.getByText("Partial (400/1000 g)")).toBeInTheDocument();
  });

  it('should render an item with "in-stock" status', () => {
    const item: ShoppingItem = {
      id: "3",
      name: "Salt",
      required: 10,
      unit: "g",
      inStock: 200,
      status: "in-stock",
    };

    render(<ShoppingItemCard item={item} />);

    expect(screen.getByText("Salt")).toBeInTheDocument();
    expect(
      screen.getByText("10 g needed (200 g in fridge)")
    ).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });
});
