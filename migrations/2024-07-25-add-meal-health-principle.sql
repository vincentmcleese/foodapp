-- up
CREATE TABLE IF NOT EXISTS meal_health_principle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meal(id) ON DELETE CASCADE,
  health_principle_id UUID NOT NULL REFERENCES health_principle(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(meal_id, health_principle_id)
);

-- Create an index to make lookups faster
CREATE INDEX IF NOT EXISTS idx_meal_health_principle_meal_id ON meal_health_principle(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_health_principle_health_principle_id ON meal_health_principle(health_principle_id);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON meal_health_principle
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- down
DROP TRIGGER IF EXISTS set_timestamp ON meal_health_principle;
DROP FUNCTION IF EXISTS trigger_set_timestamp();
DROP INDEX IF EXISTS idx_meal_health_principle_health_principle_id;
DROP INDEX IF EXISTS idx_meal_health_principle_meal_id;
DROP TABLE IF EXISTS meal_health_principle; 