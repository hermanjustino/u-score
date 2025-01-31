-- Create player_game_stats table for individual game records
CREATE TABLE player_game_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    game_id INTEGER REFERENCES games(id),
    minutes_played INTEGER,
    points INTEGER DEFAULT 0,
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    three_points_made INTEGER DEFAULT 0,
    three_points_attempted INTEGER DEFAULT 0,
    free_throws_made INTEGER DEFAULT 0,
    free_throws_attempted INTEGER DEFAULT 0,
    offensive_rebounds INTEGER DEFAULT 0,
    defensive_rebounds INTEGER DEFAULT 0,
    total_rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    personal_fouls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, game_id)
);

-- Create view for player season totals and averages
CREATE OR REPLACE VIEW player_season_stats AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.team_id,
    COUNT(DISTINCT pgs.game_id) as games_played,
    SUM(pgs.points) as total_points,
    SUM(pgs.field_goals_made) as total_fgm,
    SUM(pgs.field_goals_attempted) as total_fga,
    SUM(pgs.three_points_made) as total_3pm,
    SUM(pgs.three_points_attempted) as total_3pa,
    SUM(pgs.free_throws_made) as total_ftm,
    SUM(pgs.free_throws_attempted) as total_fta,
    SUM(pgs.offensive_rebounds) as total_offensive_rebounds,
    SUM(pgs.defensive_rebounds) as total_defensive_rebounds,
    SUM(pgs.total_rebounds) as total_rebounds,
    SUM(pgs.assists) as total_assists,
    SUM(pgs.turnovers) as total_turnovers,
    SUM(pgs.steals) as total_steals,
    SUM(pgs.blocks) as total_blocks,
    SUM(pgs.personal_fouls) as total_fouls,
    ROUND(AVG(pgs.points)::numeric, 1) as ppg,
    ROUND(AVG(pgs.total_rebounds)::numeric, 1) as rpg,
    ROUND(AVG(pgs.assists)::numeric, 1) as apg,
    ROUND(CASE 
        WHEN SUM(pgs.field_goals_attempted) > 0 
        THEN (SUM(pgs.field_goals_made)::numeric / SUM(pgs.field_goals_attempted) * 100) 
        ELSE 0 
    END, 1) as fg_percentage,
    ROUND(CASE 
        WHEN SUM(pgs.three_points_attempted) > 0 
        THEN (SUM(pgs.three_points_made)::numeric / SUM(pgs.three_points_attempted) * 100) 
        ELSE 0 
    END, 1) as three_point_percentage,
    ROUND(CASE 
        WHEN SUM(pgs.free_throws_attempted) > 0 
        THEN (SUM(pgs.free_throws_made)::numeric / SUM(pgs.free_throws_attempted) * 100) 
        ELSE 0 
    END, 1) as ft_percentage
FROM 
    players p
LEFT JOIN 
    player_game_stats pgs ON p.id = pgs.player_id
GROUP BY 
    p.id, p.first_name, p.last_name, p.team_id;