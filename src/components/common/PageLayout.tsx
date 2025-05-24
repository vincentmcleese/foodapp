"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageLayout({
  children,
  title,
  subtitle,
  actions,
  className,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className={cn("container max-w-4xl px-4 py-6 space-y-6", className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold text-neutral-800">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}

      <div className={cn("space-y-6", contentClassName)}>{children}</div>
    </div>
  );
}
