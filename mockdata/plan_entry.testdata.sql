-- Inserting mock data for plan_entry table
-- First, make sure we have meal IDs to reference
WITH meal_ids AS (
  SELECT id FROM meal LIMIT 5
)
INSERT INTO plan_entry (meal_id, day_of_week, meal_type, notes)
SELECT
  id, -- meal_id
  days.day, -- day_of_week
  meal_types.type, -- meal_type
  CASE 
    WHEN random() < 0.5 THEN 'Test notes for ' || days.day || ' ' || meal_types.type
    ELSE NULL
  END -- notes
FROM
  meal_ids,
  (VALUES
    ('monday'),
    ('wednesday'),
    ('friday')
  ) AS days(day),
  (VALUES
    ('breakfast'),
    ('lunch'),
    ('dinner')
  ) AS meal_types(type)
WHERE random() < 0.7 -- Only create entries for some combinations
LIMIT 10; -- At most 10 entries 