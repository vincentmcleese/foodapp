import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateNutrition } from '@/lib/meal';
import MealCard from '@/components/MealCard';

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
  // Fetch all meals from Supabase
  const { data: meals, error } = await supabaseAdmin
    .from('meal')
    .select(`
      *,
      meal_ingredient:meal_id (
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      )
    `);

  if (error) {
    console.error('Error fetching meals:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meals</h1>
        <p className="text-red-500">Error loading meals. Please try again later.</p>
      </div>
    );
  }

  // Process meals data
  const processedMeals = meals.map(meal => {
    const ingredients = meal.meal_ingredient || [];
    const nutrition = calculateNutrition(ingredients);

    return {
      ...meal,
      ingredients,
      nutrition,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meals</h1>
        <Link href="/meals/new" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          + Add New Meal
        </Link>
      </div>

      {processedMeals.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-600 mb-4">No meals found. Create your first meal!</p>
          <Link href="/meals/new" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create Meal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedMeals.map(meal => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
