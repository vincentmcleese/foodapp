"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface IngredientImageProps {
  imageUrl?: string | null;
  name: string;
  status?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function IngredientImage({
  imageUrl,
  name,
  status = "completed",
  className,
  width = 120,
  height = 120,
}: IngredientImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Status-based UI
  const isGenerating = status === "generating";
  const isPending = status === "pending";
  const isFailed = status === "failed";
  const hasImage = !!imageUrl && status === "completed";

  // Reset loading state when image URL changes
  useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
    }
  }, [imageUrl]);

  return (
    <div
      className={cn("relative rounded-md overflow-hidden bg-muted", className)}
      style={{ width, height }}
    >
      {hasImage && (
        <Image
          src={imageUrl as string}
          alt={`Image of ${name}`}
          fill
          sizes={`${Math.max(width, height)}px`}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
        />
      )}

      {/* Placeholder & Loading States */}
      {(isLoading || isGenerating || isPending || isFailed || !hasImage) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
          {isGenerating && (
            <>
              <Spinner size="md" className="mb-2" />
              <p className="text-xs">Generating image...</p>
            </>
          )}

          {isPending && (
            <p className="text-xs text-muted-foreground">Image pending</p>
          )}

          {isFailed && (
            <p className="text-xs text-destructive">Image generation failed</p>
          )}

          {!isGenerating && !isPending && !isFailed && !hasImage && (
            <p className="text-xs text-muted-foreground">{name}</p>
          )}

          {isLoading && hasImage && (
            <Skeleton className="h-full w-full absolute inset-0" />
          )}
        </div>
      )}
    </div>
  );
}
