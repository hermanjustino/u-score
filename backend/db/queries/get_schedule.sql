SELECT 
  g.id,
  g.date,
  g.is_conference_game,
  g.status,
  CASE 
    WHEN g.home_team_id = $1 THEN at.varsity_name
    ELSE ht.varsity_name
  END as opponent,
  CASE 
    WHEN g.home_team_id = $1 THEN 'vs'
    ELSE '@'
  END as location,
  CASE
    WHEN g.home_team_id = $1 THEN g.home_team_score::integer
    ELSE g.away_team_score::integer
  END as team_score,
  CASE
    WHEN g.home_team_id = $1 THEN g.away_team_score::integer
    ELSE g.home_team_score::integer
  END as opponent_score
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
AND g.status = 'final'
ORDER BY g.date ASC;