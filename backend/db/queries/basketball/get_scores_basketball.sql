SELECT DISTINCT ON (LEAST(home_team_id, away_team_id), GREATEST(home_team_id, away_team_id), DATE(date))
  g.*,
  ht.university as home_university,
  at.university as away_university,
  ht.varsity_name as home_team,
  at.varsity_name as away_team,
  ht.logo as home_logo,
  at.logo as away_logo,
  ht.short_name as home_short_name,
  at.short_name as away_short_name
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE g.gender = $1 AND g.status = 'final'
ORDER BY LEAST(home_team_id, away_team_id), GREATEST(home_team_id, away_team_id), DATE(date), g.id DESC;