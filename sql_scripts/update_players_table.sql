-- First, drop the view that depends on the players table
DROP VIEW IF EXISTS player_season_stats;

-- Add the new columns that aren't in your current schema
ALTER TABLE players 
  ADD COLUMN IF NOT EXISTS usports_id VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(10);

-- Modify existing column types
ALTER TABLE players 
  ALTER COLUMN first_name TYPE VARCHAR(100),
  ALTER COLUMN last_name TYPE VARCHAR(100),
  ALTER COLUMN jersey_number TYPE VARCHAR(10),
  ALTER COLUMN position TYPE VARCHAR(20),
  ALTER COLUMN hometown TYPE VARCHAR(100),
  ALTER COLUMN previous_school TYPE VARCHAR(100);

-- Create the indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_usports_id ON players(usports_id);

-- Recreate the view exactly as it was before
CREATE VIEW public.player_season_stats AS
 SELECT p.id,
    p.first_name,
    p.last_name,
    p.team_id,
    count(DISTINCT pgs.game_id) AS games_played,
    sum(pgs.points) AS total_points,
    sum(pgs.field_goals_made) AS total_fgm,
    sum(pgs.field_goals_attempted) AS total_fga,
    sum(pgs.three_points_made) AS total_3pm,
    sum(pgs.three_points_attempted) AS total_3pa,
    sum(pgs.free_throws_made) AS total_ftm,
    sum(pgs.free_throws_attempted) AS total_fta,
    sum(pgs.offensive_rebounds) AS total_offensive_rebounds,
    sum(pgs.defensive_rebounds) AS total_defensive_rebounds,
    sum(pgs.total_rebounds) AS total_rebounds,
    sum(pgs.assists) AS total_assists,
    sum(pgs.turnovers) AS total_turnovers,
    sum(pgs.steals) AS total_steals,
    sum(pgs.blocks) AS total_blocks,
    sum(pgs.personal_fouls) AS total_fouls,
    round(avg(pgs.points), 1) AS ppg,
    round(avg(pgs.total_rebounds), 1) AS rpg,
    round(avg(pgs.assists), 1) AS apg,
    round(
        CASE
            WHEN (sum(pgs.field_goals_attempted) > 0) THEN (((sum(pgs.field_goals_made))::numeric / (sum(pgs.field_goals_attempted))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 1) AS fg_percentage,
    round(
        CASE
            WHEN (sum(pgs.three_points_attempted) > 0) THEN (((sum(pgs.three_points_made))::numeric / (sum(pgs.three_points_attempted))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 1) AS three_point_percentage,
    round(
        CASE
            WHEN (sum(pgs.free_throws_attempted) > 0) THEN (((sum(pgs.free_throws_made))::numeric / (sum(pgs.free_throws_attempted))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 1) AS ft_percentage
   FROM (public.players p
     LEFT JOIN public.player_game_stats pgs ON ((p.id = pgs.player_id)))
  GROUP BY p.id, p.first_name, p.last_name, p.team_id;