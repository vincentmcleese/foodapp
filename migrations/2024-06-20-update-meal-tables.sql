-- Add missing columns to the meal table
ALTER TABLE meal 
  ADD COLUMN IF NOT EXISTS instructions TEXT,
  ADD COLUMN IF NOT EXISTS prep_time INTEGER,
  ADD COLUMN IF NOT EXISTS cook_time INTEGER,
  ADD COLUMN IF NOT EXISTS servings INTEGER,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add created_at and updated_at to meal_ingredient if they don't exist
ALTER TABLE meal_ingredient
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add unique constraint to meal_ingredient table (if it doesn't exist)
DO $$
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'meal_ingredient_meal_id_ingredient_id_key'
  ) THEN
    -- Add the constraint if it doesn't exist
    ALTER TABLE meal_ingredient 
      ADD CONSTRAINT meal_ingredient_meal_id_ingredient_id_key 
      UNIQUE (meal_id, ingredient_id);
  END IF;
END
$$;

-- Now insert sample data with all the fields
INSERT INTO meal (id, name, description, nutrition, prep_time, cook_time, servings)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Spaghetti Bolognese', 'Classic Italian pasta dish with rich meat sauce', 
   '{"calories": 450, "protein": 25, "carbs": 60, "fat": 15}'::jsonb, 15, 30, 4),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Vegetable Stir Fry', 'Quick and healthy vegetable stir fry with soy sauce', 
   '{"calories": 280, "protein": 10, "carbs": 30, "fat": 8}'::jsonb, 10, 15, 2)
ON CONFLICT (id) DO 
  UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    nutrition = EXCLUDED.nutrition,
    prep_time = EXCLUDED.prep_time,
    cook_time = EXCLUDED.cook_time,
    servings = EXCLUDED.servings;

-- Add some ingredients to the meals (only if there are ingredients in the table)
-- First, get a count of ingredients
DO $$
DECLARE 
  ingredient_count INTEGER;
  first_ingredient_id UUID;
  second_ingredient_id UUID;
BEGIN
  SELECT COUNT(*) INTO ingredient_count FROM ingredient;
  
  IF ingredient_count > 0 THEN
    -- Get first ingredient ID
    SELECT id INTO first_ingredient_id FROM ingredient LIMIT 1;
    
    -- Insert first meal ingredient without ON CONFLICT
    BEGIN
      INSERT INTO meal_ingredient (meal_id, ingredient_id, quantity, unit)
      VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', first_ingredient_id, 200, 'g');
      EXCEPTION WHEN unique_violation THEN
        -- Do nothing on unique violation
    END;
    
    -- If we have at least 2 ingredients
    IF ingredient_count > 1 THEN
      -- Get second ingredient ID
      SELECT id INTO second_ingredient_id FROM ingredient WHERE id != first_ingredient_id LIMIT 1;
      
      -- Insert second meal ingredient without ON CONFLICT
      BEGIN
        INSERT INTO meal_ingredient (meal_id, ingredient_id, quantity, unit)
        VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d480', second_ingredient_id, 150, 'g');
        EXCEPTION WHEN unique_violation THEN
          -- Do nothing on unique violation
      END;
    END IF;
  END IF;
END
$$; 