SELECT 
  g.id,
  g.date,
  g.home_team_id,
  g.away_team_id,
  g.home_team_score,
  g.away_team_score,
  g.is_conference_game,
  g.status,
  g.is_exhibition,
  ht.varsity_name as home_team,
  at.varsity_name as away_team,
  ht.university as home_university,
  at.university as away_university
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE g.gender = $1 
AND g.status = 'final'
ORDER BY g.date DESC;