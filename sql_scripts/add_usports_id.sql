-- First, drop the website_key column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'website_key'
    ) THEN
        ALTER TABLE teams DROP COLUMN website_key;
    END IF;
END
$$;

-- Add a new column for website-friendly short names
ALTER TABLE teams ADD COLUMN website_key VARCHAR(50);

-- Populate it with the lowercase/no-spaces version of short_name
UPDATE teams
SET website_key = LOWER(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(short_name, ' ', ''),
                        '.', ''),
                    ',', ''),
                '''', ''),
            '-', ''),
        'university', '')
    );

-- View the results
SELECT id, university, short_name, website_key
FROM teams
ORDER BY gender, university;