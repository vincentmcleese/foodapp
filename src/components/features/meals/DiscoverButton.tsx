"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function DiscoverButton() {
  const router = useRouter();

  const handleDiscoverClick = () => {
    router.push("/meals/discover");
  };

  return (
    <Button
      onClick={handleDiscoverClick}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
    >
      <SparklesIcon className="mr-2 h-5 w-5" data-testid="discover-icon" />
      Discover New Meals
    </Button>
  );
}
