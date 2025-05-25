"use client";

import { useToast } from "@/hooks/use-toast";
import { ToastAction, type ToastActionElement } from "@/components/ui/toast";
import React from "react";

interface EnhancedToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useEnhancedToast() {
  const { toast } = useToast();

  const showToast = (options: EnhancedToastOptions) => {
    let actionElement: ToastActionElement | undefined;

    if (options.action) {
      actionElement = React.createElement(
        ToastAction,
        {
          altText: options.action.label,
          onClick: options.action.onClick,
        },
        options.action.label
      ) as unknown as ToastActionElement;
    }

    return toast({
      title: options.title,
      description: options.description,
      variant: options.variant || "default",
      duration: options.duration || 3000,
      action: actionElement,
    });
  };

  const success = (
    title: string,
    description?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    return showToast({
      title,
      description,
      variant: "default",
      duration: 3000,
      action,
    });
  };

  const error = (
    title: string,
    description?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    return showToast({
      title,
      description,
      variant: "destructive",
      duration: 4000, // Errors stay a bit longer
      action,
    });
  };

  const warning = (
    title: string,
    description?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    return showToast({
      title,
      description,
      variant: "default",
      duration: 3500,
      action,
    });
  };

  return {
    toast: showToast,
    success,
    error,
    warning,
  };
}
