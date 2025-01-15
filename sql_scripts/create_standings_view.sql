CREATE OR REPLACE VIEW team_standings AS
WITH game_results AS (
    -- Home games
    SELECT 
        home_team_id as team_id,
        gender,
        is_conference_game,
        COUNT(*) as games_played,
        SUM(CASE WHEN home_team_score > away_team_score THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN home_team_score < away_team_score THEN 1 ELSE 0 END) as losses,
        SUM(home_team_score) as points_for,
        SUM(away_team_score) as points_against
    FROM games
    WHERE status = 'final'
    GROUP BY home_team_id, gender, is_conference_game
    
    UNION ALL
    
    -- Away games
    SELECT 
        away_team_id as team_id,
        gender,
        is_conference_game,
        COUNT(*) as games_played,
        SUM(CASE WHEN away_team_score > home_team_score THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN away_team_score < home_team_score THEN 1 ELSE 0 END) as losses,
        SUM(away_team_score) as points_for,
        SUM(home_team_score) as points_against
    FROM games
    WHERE status = 'final'
    GROUP BY away_team_id, gender, is_conference_game
)
SELECT 
    t.id,
    t.university,
    t.varsity_name,
    t.conference,
    t.division,
    t.gender,
    conf.games_played as conference_games,
    conf.wins as conference_wins,
    conf.losses as conference_losses,
    nonconf.games_played as total_games,
    nonconf.wins as total_wins,
    nonconf.losses as total_losses,
    conf.points_for as conference_points_for,
    conf.points_against as conference_points_against
FROM teams t
LEFT JOIN (
    SELECT * FROM game_results WHERE is_conference_game = true
) conf ON t.id = conf.team_id AND t.gender = conf.gender
LEFT JOIN (
    SELECT * FROM game_results WHERE is_conference_game = false
) nonconf ON t.id = nonconf.team_id AND t.gender = nonconf.gender
ORDER BY t.conference, t.division, 
    COALESCE(CAST(conf.wins AS DECIMAL) / NULLIF(conf.games_played, 0), 0) DESC;