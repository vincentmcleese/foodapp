-- Supabase SQL schema setup file
-- Run this in the Supabase SQL Editor to create the required tables

-- Create ingredient table
CREATE TABLE IF NOT EXISTS public.ingredient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    usda_fdc_id INTEGER,
    nutrition JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fridge_item table
CREATE TABLE IF NOT EXISTS public.fridge_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES public.ingredient(id),
    quantity FLOAT NOT NULL,
    unit TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal table
CREATE TABLE IF NOT EXISTS public.meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    nutrition JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal_ingredient table
CREATE TABLE IF NOT EXISTS public.meal_ingredient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES public.meal(id),
    ingredient_id UUID NOT NULL REFERENCES public.ingredient(id),
    quantity FLOAT NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal_plan table
CREATE TABLE IF NOT EXISTS public.meal_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES public.meal(id),
    date TIMESTAMPTZ NOT NULL,
    meal_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create health_principle table
CREATE TABLE IF NOT EXISTS public.health_principle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dietary_goals JSONB,
    allergies JSONB,
    notification_interval INTEGER,
    dark_mode BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES public.meal(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert some sample ingredients for testing
INSERT INTO public.ingredient (name) VALUES
('Tomatoes'),
('Potatoes'),
('Onions'),
('Garlic'),
('Chicken'),
('Rice'),
('Pasta'),
('Olive Oil')
ON CONFLICT (name) DO NOTHING; 