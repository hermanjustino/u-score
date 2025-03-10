WITH game_results AS (
  SELECT 
    home_team_id as team_id,
    SUM(CASE WHEN home_team_score > away_team_score THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN home_team_score < away_team_score THEN 1 ELSE 0 END) as losses,
    SUM(home_team_score) as points_for,
    SUM(away_team_score) as points_against
  FROM games 
  WHERE gender = $1
  GROUP BY home_team_id
  
  UNION ALL
  
  SELECT 
    away_team_id as team_id,
    SUM(CASE WHEN away_team_score > home_team_score THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN away_team_score < home_team_score THEN 1 ELSE 0 END) as losses,
    SUM(away_team_score) as points_for,
    SUM(home_team_score) as points_against
  FROM games 
  WHERE gender = $1
  GROUP BY away_team_id
)
SELECT 
  t.*,
  COALESCE(SUM(gr.wins), 0) as wins,
  COALESCE(SUM(gr.losses), 0) as losses,
  COALESCE(SUM(gr.points_for), 0) as points_for,
  COALESCE(SUM(gr.points_against), 0) as points_against,
  COALESCE(SUM(gr.wins + gr.losses), 0) as games_played
FROM teams t
LEFT JOIN game_results gr ON t.id = gr.team_id
WHERE t.gender = $1
GROUP BY t.id
ORDER BY t.conference, t.division NULLS FIRST, wins DESC, points_for DESC;