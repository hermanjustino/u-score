const { Pool } = require('pg');

const pool = new Pool({
  user: 'hermanjustino',
  host: 'localhost',
  database: 'usports_basketball',
  password: '',
  port: 5432,
});

async function updateTestScores() {
  try {
    console.log('Updating test scores...');
    
    // Men's games - using subquery with LIMIT instead of direct LIMIT
    const menResult = await pool.query(`
      UPDATE games 
      SET 
        home_team_score = floor(random() * 30) + 60,
        away_team_score = floor(random() * 30) + 60,
        status = 'final'
      WHERE id IN (
        SELECT id 
        FROM games 
        WHERE status = 'scheduled' AND gender = 'men'
        ORDER BY date
        LIMIT 25
      )
      RETURNING id, date, gender;
    `);
    
    // Women's games
    const womenResult = await pool.query(`
      UPDATE games 
      SET 
        home_team_score = floor(random() * 25) + 55,
        away_team_score = floor(random() * 25) + 55,
        status = 'final'
      WHERE id IN (
        SELECT id 
        FROM games 
        WHERE status = 'scheduled' AND gender = 'women'
        ORDER BY date
        LIMIT 25
      )
      RETURNING id, date, gender;
    `);
    
    // Print results summary
    const totalUpdated = menResult.rowCount + womenResult.rowCount;
    console.log(`Updated ${totalUpdated} games with test scores:`);
    console.log(`- Men's games: ${menResult.rowCount}`);
    console.log(`- Women's games: ${womenResult.rowCount}`);
    
  } catch (err) {
    console.error('Error updating test scores:', err);
  } finally {
    pool.end();
    console.log('Database connection closed.');
  }
}

updateTestScores();