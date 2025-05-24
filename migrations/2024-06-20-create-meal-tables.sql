-- Create meal table
CREATE TABLE IF NOT EXISTS meal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_ingredient junction table
CREATE TABLE IF NOT EXISTS meal_ingredient (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meal(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meal_id, ingredient_id)
);

-- Create sample data
INSERT INTO meal (id, name, description, prep_time, cook_time, servings)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Spaghetti Bolognese', 'Classic Italian pasta dish with rich meat sauce', 15, 30, 4),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Vegetable Stir Fry', 'Quick and healthy vegetable stir fry with soy sauce', 10, 15, 2);

-- Add some ingredients to the meals
INSERT INTO meal_ingredient (meal_id, ingredient_id, quantity, unit)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
  id, 
  200, 
  'g'
FROM ingredient 
LIMIT 1;

INSERT INTO meal_ingredient (meal_id, ingredient_id, quantity, unit)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d480', 
  id, 
  150, 
  'g'
FROM ingredient 
OFFSET 1
LIMIT 1; 