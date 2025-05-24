import { calculateNutrition, formatNutritionValue, calculateTotalTime, formatTime } from './meal';
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
          meal_id: 'meal-1',
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
          meal_id: 'meal-1',
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
          meal_id: 'meal-1',
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
          meal_id: 'meal-1',
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
          meal_id: 'meal-1',
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

  describe('formatNutritionValue', () => {
    it('should format a nutrition value with default unit (g)', () => {
      expect(formatNutritionValue(10)).toBe('10g');
    });

    it('should format a nutrition value with custom unit', () => {
      expect(formatNutritionValue(10, 'mg')).toBe('10mg');
    });

    it('should format a decimal nutrition value', () => {
      expect(formatNutritionValue(10.5, 'g')).toBe('10.5g');
    });
  });

  describe('calculateTotalTime', () => {
    it('should calculate total time from prep and cook times', () => {
      expect(calculateTotalTime(15, 30)).toBe(45);
    });

    it('should handle missing prep time', () => {
      expect(calculateTotalTime(undefined, 30)).toBe(30);
    });

    it('should handle missing cook time', () => {
      expect(calculateTotalTime(15, undefined)).toBe(15);
    });

    it('should handle both times missing', () => {
      expect(calculateTotalTime(undefined, undefined)).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format minutes to just minutes when less than an hour', () => {
      expect(formatTime(45)).toBe('45m');
    });

    it('should format time to hours and minutes when more than an hour', () => {
      expect(formatTime(90)).toBe('1h 30m');
    });

    it('should format time to just hours when minutes are 0', () => {
      expect(formatTime(120)).toBe('2h');
    });

    it('should handle undefined time', () => {
      expect(formatTime(undefined)).toBe('0m');
    });

    it('should handle 0 minutes', () => {
      expect(formatTime(0)).toBe('0m');
    });
  });
}); 