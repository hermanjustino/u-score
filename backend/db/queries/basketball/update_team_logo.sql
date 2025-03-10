UPDATE teams 
SET logo = $1 
WHERE id = $2 
RETURNING id, logo;