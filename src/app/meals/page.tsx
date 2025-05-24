import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateNutrition } from '@/lib/meal';
import MealCard from '@/components/MealCard';
import { PageLayout } from '@/components/common/PageLayout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Card } from '@/components/common/Card';

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
  // Fetch all meals from Supabase
  const { data: meals, error } = await supabaseAdmin
    .from('meal')
    .select(`
      *,
      meal_ingredient!meal_id (
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      )
    `);

  if (error) {
    console.error('Error fetching meals:', error);
    return (
      <PageLayout title="Meals">
        <Card variant="outlined" className="p-6 text-center">
          <p className="text-error">Error loading meals. Please try again later.</p>
        </Card>
      </PageLayout>
    );
  }

  // Fetch all meal ratings
  const { data: allRatings, error: ratingsError } = await supabaseAdmin
    .from("meal_rating")
    .select("*");

  if (ratingsError) {
    console.error("Error fetching meal ratings:", ratingsError);
    // Continue without ratings rather than failing the request
  }

  // Group ratings by meal_id
  const ratingsByMeal = (allRatings || []).reduce((acc, rating) => {
    if (!acc[rating.meal_id]) {
      acc[rating.meal_id] = [];
    }
    acc[rating.meal_id].push(rating);
    return acc;
  }, {} as Record<string, any[]>);

  // Process meals data
  const processedMeals = meals.map(meal => {
    const ingredients = meal.meal_ingredient || [];
    const nutrition = calculateNutrition(ingredients);
    
    // Calculate rating summary if available
    const mealRatings = ratingsByMeal[meal.id] || [];
    const likes = mealRatings.filter((r: { rating: boolean }) => r.rating === true).length;
    const dislikes = mealRatings.filter((r: { rating: boolean }) => r.rating === false).length;
    
    const ratings = {
      likes,
      dislikes,
      total: mealRatings.length
    };

    return {
      ...meal,
      ingredients,
      nutrition,
      ratings
    };
  });

  // Create the "Add New Meal" button for the page actions
  const AddMealButton = (
    <Link href="/meals/new">
      <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
        Add New Meal
      </Button>
    </Link>
  );

  return (
    <PageLayout 
      title="Meals" 
      subtitle="Browse and manage your meals" 
      actions={AddMealButton}
    >
      {processedMeals.length === 0 ? (
        <Card variant="outlined" className="p-8 text-center">
          <p className="text-neutral-600 mb-4">No meals found. Create your first meal!</p>
          <Link href="/meals/new">
            <Button variant="soft" leftIcon={<PlusIcon className="w-4 h-4" />}>
              Create Meal
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedMeals.map(meal => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
