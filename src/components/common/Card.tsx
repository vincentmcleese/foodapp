"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "outlined" | "compact";
  onClick?: () => void;
  id?: string;
}

export function Card({
  children,
  className,
  variant = "default",
  onClick,
  id,
}: CardProps) {
  // Base styles for all card variants
  const baseStyles = "rounded-2xl transition-all duration-normal";

  // Variant-specific styles
  const variantStyles = {
    default: "bg-white border border-neutral-200 shadow-md p-6",
    highlight: "bg-primary-50 border border-primary-100 shadow-md p-6",
    outlined: "bg-white border-2 border-neutral-300 p-6",
    compact: "bg-white border border-neutral-200 shadow-sm p-4",
  };

  return (
    <div
      id={id}
      className={cn(
        baseStyles,
        variantStyles[variant],
        onClick && "cursor-pointer hover:shadow-lg",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
