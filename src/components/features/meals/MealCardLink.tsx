"use client";

import { useRouter } from "next/navigation";
import { MealCard, MealCardProps } from "./MealCard";

interface MealCardLinkProps extends Omit<MealCardProps, "onClick"> {
  href: string;
}

export function MealCardLink({ href, ...props }: MealCardLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return <MealCard {...props} onClick={handleClick} />;
}
