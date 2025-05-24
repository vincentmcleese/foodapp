-- up: Create meal_rating table and add sample data

-- Check if meal_rating table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meal_rating') THEN
    -- Create meal_rating table
    CREATE TABLE public.meal_rating (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meal_id UUID NOT NULL,
      rating BOOLEAN NOT NULL, -- true for like, false for dislike
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add foreign key constraint
    ALTER TABLE public.meal_rating
      ADD CONSTRAINT fk_meal_rating_meal
      FOREIGN KEY (meal_id)
      REFERENCES public.meal(id)
      ON DELETE CASCADE;

    -- Add comment on table
    COMMENT ON TABLE public.meal_rating IS 'User ratings for meals (like/dislike)';
  END IF;
END $$;

-- Add sample ratings if needed for testing
DO $$ 
BEGIN
  -- Add some sample ratings if table is empty
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meal_rating') 
     AND NOT EXISTS (SELECT 1 FROM public.meal_rating LIMIT 1) THEN
    
    -- Get the first three meals
    INSERT INTO public.meal_rating (meal_id, rating)
    SELECT 
      id, 
      CASE 
        WHEN random() > 0.5 THEN true  -- 50% chance of like
        ELSE false                    -- 50% chance of dislike
      END
    FROM public.meal
    LIMIT 3;
  END IF;
END $$; 