import { MealForm } from "@/components/features/meals/MealForm";
import { PageLayout } from "@/components/common/PageLayout";

export default function NewMealPage() {
  return (
    <PageLayout
      title="Create New Meal"
      subtitle="Add a new meal to your collection"
    >
      <MealForm />
    </PageLayout>
  );
}
