-- up: Create tables needed for meal planning and shopping features

-- Check if plan_entry table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plan_entry') THEN
    -- Create plan_entry table
    CREATE TABLE public.plan_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meal_id UUID NOT NULL,
      date DATE NOT NULL,
      meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add comment on table
    COMMENT ON TABLE public.plan_entry IS 'Meal plan entries for each day';
  END IF;
END $$;

-- Check if meal table exists and create if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meal') THEN
    -- Create meal table
    CREATE TABLE public.meal (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      image_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add comment on table
    COMMENT ON TABLE public.meal IS 'Meals with details and instructions';
  END IF;
END $$;

-- Check if meal_ingredient table exists and create if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meal_ingredient') THEN
    -- Create meal_ingredient table
    CREATE TABLE public.meal_ingredient (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meal_id UUID NOT NULL,
      ingredient_id UUID NOT NULL,
      quantity NUMERIC NOT NULL,
      unit TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add comment on table
    COMMENT ON TABLE public.meal_ingredient IS 'Ingredients for each meal with quantities';
  END IF;
END $$;

-- Check if ingredient table exists and create if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ingredient') THEN
    -- Create ingredient table
    CREATE TABLE public.ingredient (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      usda_fdc_id INTEGER,
      nutrition JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add comment on table
    COMMENT ON TABLE public.ingredient IS 'Food ingredients with optional nutrition data';
  END IF;
END $$;

-- Check if fridge_item table exists and create if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fridge_item') THEN
    -- Create fridge_item table
    CREATE TABLE public.fridge_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ingredient_id UUID NOT NULL,
      quantity NUMERIC NOT NULL,
      unit TEXT NOT NULL,
      expires_at DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add comment on table
    COMMENT ON TABLE public.fridge_item IS 'Items currently in the fridge with quantities';
  END IF;
END $$;

-- Insert some sample data for testing
DO $$ 
BEGIN
  -- Add some ingredients if none exist
  IF NOT EXISTS (SELECT 1 FROM public.ingredient LIMIT 1) THEN
    INSERT INTO public.ingredient (name) VALUES 
      ('Chicken Breast'),
      ('Rice'),
      ('Broccoli'),
      ('Olive Oil'),
      ('Salt'),
      ('Pepper'),
      ('Garlic'),
      ('Onion'),
      ('Tomato'),
      ('Pasta');
  END IF;

  -- Add some meals if none exist
  IF NOT EXISTS (SELECT 1 FROM public.meal LIMIT 1) THEN
    INSERT INTO public.meal (name, description, prep_time, cook_time, servings) VALUES 
      ('Chicken and Rice', 'Simple chicken and rice dish', 10, 30, 4),
      ('Pasta with Tomato Sauce', 'Classic pasta dish', 5, 15, 2),
      ('Roasted Vegetables', 'Healthy side dish', 15, 25, 3);
  END IF;

  -- Link ingredients to meals if no meal ingredients exist
  IF NOT EXISTS (SELECT 1 FROM public.meal_ingredient LIMIT 1) THEN
    -- Get IDs
    INSERT INTO public.meal_ingredient (meal_id, ingredient_id, quantity, unit)
    SELECT 
      m.id,
      i.id,
      CASE i.name
        WHEN 'Chicken Breast' THEN 500
        WHEN 'Rice' THEN 200
        WHEN 'Olive Oil' THEN 15
        WHEN 'Salt' THEN 5
        WHEN 'Pepper' THEN 3
        ELSE 100
      END,
      CASE i.name
        WHEN 'Salt' THEN 'g'
        WHEN 'Pepper' THEN 'g'
        WHEN 'Olive Oil' THEN 'ml'
        ELSE 'g'
      END
    FROM 
      public.meal m,
      public.ingredient i
    WHERE 
      m.name = 'Chicken and Rice' 
      AND i.name IN ('Chicken Breast', 'Rice', 'Olive Oil', 'Salt', 'Pepper')
    LIMIT 5;

    INSERT INTO public.meal_ingredient (meal_id, ingredient_id, quantity, unit)
    SELECT 
      m.id,
      i.id,
      CASE i.name
        WHEN 'Pasta' THEN 200
        WHEN 'Tomato' THEN 300
        WHEN 'Olive Oil' THEN 10
        WHEN 'Salt' THEN 3
        WHEN 'Garlic' THEN 10
        ELSE 100
      END,
      CASE i.name
        WHEN 'Salt' THEN 'g'
        WHEN 'Garlic' THEN 'g'
        WHEN 'Olive Oil' THEN 'ml'
        ELSE 'g'
      END
    FROM 
      public.meal m,
      public.ingredient i
    WHERE 
      m.name = 'Pasta with Tomato Sauce' 
      AND i.name IN ('Pasta', 'Tomato', 'Olive Oil', 'Salt', 'Garlic')
    LIMIT 5;
  END IF;

  -- Add some fridge items if none exist
  IF NOT EXISTS (SELECT 1 FROM public.fridge_item LIMIT 1) THEN
    INSERT INTO public.fridge_item (ingredient_id, quantity, unit)
    SELECT id, 
      CASE name
        WHEN 'Chicken Breast' THEN 300
        WHEN 'Rice' THEN 500
        WHEN 'Pasta' THEN 400
        WHEN 'Salt' THEN 100
        WHEN 'Pepper' THEN 50
        ELSE 200
      END,
      CASE name
        WHEN 'Salt' THEN 'g'
        WHEN 'Pepper' THEN 'g'
        WHEN 'Olive Oil' THEN 'ml'
        ELSE 'g'
      END
    FROM public.ingredient
    WHERE name IN ('Chicken Breast', 'Rice', 'Pasta', 'Salt', 'Pepper', 'Olive Oil')
    LIMIT 6;
  END IF;

  -- Add plan entries if none exist
  IF NOT EXISTS (SELECT 1 FROM public.plan_entry LIMIT 1) THEN
    INSERT INTO public.plan_entry (meal_id, date, meal_type)
    SELECT 
      id, 
      CURRENT_DATE, 
      'dinner'
    FROM public.meal
    WHERE name = 'Chicken and Rice'
    LIMIT 1;

    INSERT INTO public.plan_entry (meal_id, date, meal_type)
    SELECT 
      id, 
      CURRENT_DATE + INTERVAL '1 day', 
      'dinner'
    FROM public.meal
    WHERE name = 'Pasta with Tomato Sauce'
    LIMIT 1;
  END IF;
END $$; 