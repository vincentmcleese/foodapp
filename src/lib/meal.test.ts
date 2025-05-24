import { calculateNutrition } from './meal';
// Importing types for test typings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Ingredient } from './api-services';

describe('Meal Business Logic', () => {
  describe('calculateNutrition', () => {
    it('should calculate total nutrition from ingredients', () => {
      // Sample ingredients with nutrition data
      const ingredients = [
        {
          id: '1',
          ingredient_id: 'ing-1',
          quantity: 100,
          unit: 'g',
          ingredient: {
            id: 'ing-1',
            name: 'Apple',
            nutrition: {
              calories: 52,
              protein: 0.3,
              carbs: 13.8,
              fat: 0.2
            }
          }
        },
        {
          id: '2',
          ingredient_id: 'ing-2',
          quantity: 200,
          unit: 'g',
          ingredient: {
            id: 'ing-2',
            name: 'Chicken Breast',
            nutrition: {
              calories: 165,
              protein: 31,
              carbs: 0,
              fat: 3.6
            }
          }
        }
      ];

      const expectedNutrition = {
        calories: 382, // (52 * 1) + (165 * 2)
        protein: 62.3, // (0.3 * 1) + (31 * 2)
        carbs: 13.8,   // (13.8 * 1) + (0 * 2)
        fat: 7.4       // (0.2 * 1) + (3.6 * 2)
      };

      const result = calculateNutrition(ingredients);
      expect(result).toEqual(expectedNutrition);
    });

    it('should handle ingredients without nutrition data', () => {
      const ingredients = [
        {
          id: '1',
          ingredient_id: 'ing-1',
          quantity: 100,
          unit: 'g',
          ingredient: {
            id: 'ing-1',
            name: 'Apple',
            nutrition: {
              calories: 52,
              protein: 0.3,
              carbs: 13.8,
              fat: 0.2
            }
          }
        },
        {
          id: '2',
          ingredient_id: 'ing-2',
          quantity: 50,
          unit: 'g',
          ingredient: {
            id: 'ing-2',
            name: 'Unknown Ingredient',
            // No nutrition data
          }
        }
      ];

      const expectedNutrition = {
        calories: 52,  // Only from the apple
        protein: 0.3,
        carbs: 13.8,
        fat: 0.2
      };

      const result = calculateNutrition(ingredients);
      expect(result).toEqual(expectedNutrition);
    });

    it('should return zero values when no ingredients have nutrition data', () => {
      const ingredients = [
        {
          id: '1',
          ingredient_id: 'ing-1',
          quantity: 100,
          unit: 'g',
          ingredient: {
            id: 'ing-1',
            name: 'Unknown Ingredient',
            // No nutrition data
          }
        }
      ];

      const expectedNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };

      const result = calculateNutrition(ingredients);
      expect(result).toEqual(expectedNutrition);
    });
  });
}); 