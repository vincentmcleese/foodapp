-- up: Add ingredient type and update fridge_item table for Sprint 11

-- Add ingredient_type column to ingredient table
ALTER TABLE public.ingredient
  ADD COLUMN IF NOT EXISTS ingredient_type TEXT NOT NULL DEFAULT 'regular' CHECK (ingredient_type IN ('pantry', 'regular'));

-- Add comment on ingredient_type column
COMMENT ON COLUMN public.ingredient.ingredient_type IS 'Type of ingredient: pantry (basics like salt, oil) or regular (measured ingredients)';

-- Update the fridge_item table to handle pantry items status
ALTER TABLE public.fridge_item
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('IN_STOCK', 'NOT_IN_STOCK'));

-- Add comment on status column
COMMENT ON COLUMN public.fridge_item.status IS 'Status for pantry items: IN_STOCK or NOT_IN_STOCK';

-- Update constraints to make quantity and unit optional for pantry items
ALTER TABLE public.fridge_item
  ALTER COLUMN quantity DROP NOT NULL,
  ALTER COLUMN unit DROP NOT NULL;

-- Add check constraint to ensure pantry items have status
ALTER TABLE public.fridge_item
  ADD CONSTRAINT fridge_item_pantry_status CHECK (
    (status IS NOT NULL AND quantity IS NULL AND unit IS NULL) OR
    (status IS NULL AND quantity IS NOT NULL AND unit IS NOT NULL)
  );

-- Update existing data: set common pantry items
UPDATE public.ingredient 
SET ingredient_type = 'pantry'
WHERE name IN ('Salt', 'Pepper', 'Olive Oil', 'Garlic', 'Sugar', 'Flour', 'Baking Powder', 'Baking Soda', 'Vinegar', 'Soy Sauce');

-- Update existing fridge items based on ingredient type
UPDATE public.fridge_item fi
SET status = 'IN_STOCK',
    quantity = NULL,
    unit = NULL
FROM public.ingredient i
WHERE fi.ingredient_id = i.id
AND i.ingredient_type = 'pantry';

-- down: Revert changes
-- ALTER TABLE public.ingredient DROP COLUMN IF EXISTS ingredient_type;
-- ALTER TABLE public.fridge_item DROP CONSTRAINT IF EXISTS fridge_item_pantry_status;
-- ALTER TABLE public.fridge_item DROP COLUMN IF EXISTS status;
-- ALTER TABLE public.fridge_item ALTER COLUMN quantity SET NOT NULL;
-- ALTER TABLE public.fridge_item ALTER COLUMN unit SET NOT NULL; 