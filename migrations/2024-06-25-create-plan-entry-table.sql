-- up
CREATE TABLE IF NOT EXISTS plan_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meal(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries when grouping by day and meal type
CREATE INDEX IF NOT EXISTS idx_plan_entry_day_meal_type ON plan_entry(day_of_week, meal_type);

-- down
DROP INDEX IF EXISTS idx_plan_entry_day_meal_type;
DROP TABLE IF EXISTS plan_entry; 