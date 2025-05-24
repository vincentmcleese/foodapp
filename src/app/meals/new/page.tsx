import MealForm from "@/components/MealForm";

export default function NewMealPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Meal</h1>
      <MealForm />
    </div>
  );
}
