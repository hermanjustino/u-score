-- Fix the Bishop's University database issues

-- Check current state of Bishop's records
SELECT id, university, varsity_name, short_name, gender, website_key, lookup_key, usports_id
FROM teams
WHERE university LIKE '%Bishop%' 
   OR varsity_name LIKE '%Gaiters%'
   OR short_name LIKE '%Bishop%';

-- Fix short_name for consistency if needed
UPDATE teams
SET short_name = 'Bishop''s' 
WHERE university LIKE '%Bishop%' 
   OR varsity_name LIKE '%Gaiters%';

-- Ensure website_key is correct
UPDATE teams
SET website_key = 'bishops'
WHERE university LIKE '%Bishop%' 
   OR varsity_name LIKE '%Gaiters%'
   OR short_name LIKE '%Bishop%';

-- Create lookup_key again (temporary)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'lookup_key'
    ) THEN
        ALTER TABLE teams ADD COLUMN lookup_key VARCHAR(50);
    END IF;
END
$$;

-- Set lookup_key explicitly
UPDATE teams
SET lookup_key = 'bishops'
WHERE university LIKE '%Bishop%' 
   OR varsity_name LIKE '%Gaiters%'
   OR short_name LIKE '%Bishop%';

-- Update the usports_id values directly for Bishop's teams
UPDATE teams
SET usports_id = CASE 
    WHEN gender = 'men' THEN 'qcs7pz9glidqf06w'
    WHEN gender = 'women' THEN '4lnd4qf0ugx92g97'
    ELSE NULL
END
WHERE university LIKE '%Bishop%' 
   OR varsity_name LIKE '%Gaiters%'
   OR short_name LIKE '%Bishop%';

-- Show the updated records
SELECT id, university, varsity_name, short_name, gender, website_key, lookup_key, usports_id
FROM teams
WHERE university LIKE '%Bishop%' 
   OR varsity_name LIKE '%Gaiters%'
   OR short_name LIKE '%Bishop%';