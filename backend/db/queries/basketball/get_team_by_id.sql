SELECT 
  t.id,
  t.university,
  t.varsity_name,
  t.short_name,
  t.logo,
  t.gender,
  t.conference,
  t.usports_id
FROM teams t
WHERE t.id = $1;