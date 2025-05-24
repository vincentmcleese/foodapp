"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  optional?: boolean;
  hint?: string;
  className?: string;
}

export function FormField({
  id,
  label,
  children,
  error,
  optional = false,
  hint,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none",
            error ? "text-error" : "text-neutral-700"
          )}
        >
          {label}
          {optional && (
            <span className="text-neutral-400 ml-1">(Optional)</span>
          )}
        </Label>
      </div>

      {children}

      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
