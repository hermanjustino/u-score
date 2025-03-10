SELECT DISTINCT ON (LEAST(g.home_team_id, g.away_team_id), GREATEST(g.home_team_id, g.away_team_id), DATE(g.date))
  g.id,
  g.date,
  g.status,
  g.is_conference_game,
  g.is_overtime,
  g.is_exhibition,
  CASE 
    WHEN g.home_team_id = $1 THEN g.home_team_score
    ELSE g.away_team_score
  END as team_score,
  CASE 
    WHEN g.home_team_id = $1 THEN g.away_team_score
    ELSE g.home_team_score
  END as opponent_score,
  CASE 
    WHEN g.home_team_id = $1 THEN 'vs.'
    ELSE '@'
  END as location,
  CASE 
    WHEN g.home_team_id = $1 THEN at.university 
    ELSE ht.university
  END as opponent,
  CASE 
    WHEN g.home_team_id = $1 THEN at.short_name
    ELSE ht.short_name
  END as opponent_short,
  CASE 
    WHEN g.home_team_id = $1 THEN at.logo
    ELSE ht.logo
  END as opponent_logo
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE g.home_team_id = $1 OR g.away_team_id = $1
ORDER BY LEAST(g.home_team_id, g.away_team_id), GREATEST(g.home_team_id, g.away_team_id), DATE(g.date), g.id DESC;