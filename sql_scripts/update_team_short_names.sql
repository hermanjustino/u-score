-- update_team_short_names.sql
-- Script to update short names for specific teams in the database
-- Created: March 2025

UPDATE teams
SET short_name = CASE
  WHEN id = 4 THEN 'Memorial'
  WHEN id = 52 THEN 'Memorial'
  WHEN id = 7 THEN 'StFX'
  WHEN id = 54 THEN 'StFX'
  WHEN id = 8 THEN 'UNB'
  WHEN id = 56 THEN 'UNB'
  WHEN id = 5 THEN 'UPEI'
  WHEN id = 55 THEN 'UPEI'
  WHEN id = 11 THEN 'UBC'
  WHEN id = 62 THEN 'UBC'
  WHEN id = 19 THEN 'UBC Okanagan'
  WHEN id = 63 THEN 'UBC Okanagan'
  WHEN id = 18 THEN 'UNBC'
  WHEN id = 68 THEN 'UNBC'
  WHEN id = 13 THEN 'UFV'
  WHEN id = 65 THEN 'UFV'
  WHEN id = 29 THEN 'Ontario Tech'
  WHEN id = 78 THEN 'Ontario Tech'
  WHEN id = 35 THEN 'Western'
  WHEN id = 83 THEN 'Western'
  WHEN id = 36 THEN 'Laurier'
  WHEN id = 85 THEN 'Laurier'
  WHEN id = 46 THEN 'Laval'
  WHEN id = 95 THEN 'Laval'
  WHEN id = 48 THEN 'UQAM'
  WHEN id = 96 THEN 'UQAM'
  ELSE short_name
END
WHERE id IN (4, 52, 7, 54, 8, 56, 5, 55, 11, 62, 19, 63, 18, 68, 13, 65, 29, 78, 35, 83, 36, 85, 46, 95, 48, 96);

-- View the updated records
SELECT id, university, short_name, gender FROM teams
WHERE id IN (4, 52, 7, 54, 8, 56, 5, 55, 11, 62, 19, 63, 18, 68, 13, 65, 29, 78, 35, 83, 36, 85, 46, 95, 48, 96)
ORDER BY university;