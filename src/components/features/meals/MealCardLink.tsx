"use client";

import { useRouter } from "next/navigation";
import { MealCardProps } from "./MealCard";
import { MealCardWithFridgePercentage } from "./MealCardWithFridgePercentage";

interface MealCardLinkProps extends Omit<MealCardProps, "onClick"> {
  href: string;
  mealIngredients?: any[];
}

export function MealCardLink({
  href,
  mealIngredients,
  ...props
}: MealCardLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <MealCardWithFridgePercentage
      {...props}
      onClick={handleClick}
      mealIngredients={mealIngredients}
    />
  );
}
