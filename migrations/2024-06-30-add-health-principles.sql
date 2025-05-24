-- up
-- Create health_principle table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.health_principle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert sample health principles if they don't exist
INSERT INTO public.health_principle (name, description, enabled)
VALUES 
('Minimize Ultra-Processed Foods', 'Avoid foods with artificial colors, flavors, sweeteners, and preservatives.', true),
('Focus on Plant-Based Foods', 'Eat more vegetables, fruits, legumes, whole grains, nuts, and seeds.', true),
('Balance Macronutrients', 'Ensure your meals have a balance of proteins, carbohydrates, and healthy fats.', true),
('Stay Hydrated', 'Drink enough water throughout the day to maintain proper hydration.', true),
('Practice Mindful Eating', 'Pay attention to hunger and fullness cues, and enjoy your food without distractions.', true)
ON CONFLICT (name) DO NOTHING;

-- down
-- DROP TABLE IF EXISTS public.health_principle; 