SELECT 
  g.id,
  g.date,
  g.status,
  g.is_conference_game,
  ht.varsity_name as home_team,
  at.varsity_name as away_team,
  ht.university as home_university,
  at.university as away_university,
  g.home_team_score,
  g.away_team_score
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE g.gender = $1
ORDER BY g.date DESC;