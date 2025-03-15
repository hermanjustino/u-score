const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');

// Import all helpers
const { getStandings } = require('./db/helpers/get_standings_helper');
const { getSchedule } = require('./db/helpers/get_schedule_helper');
const { getAllGames } = require('./db/helpers/get_games_helper');
const { getScores } = require('./db/helpers/get_scores_helper');
const { getTeamsByGender, getTeamById, updateTeamLogo } = require('./db/helpers/teams_helper');

const app = express();
const port = 5001;
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'hermanjustino',
  host: 'localhost',
  database: 'usports_basketball',
  password: '',
  port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to database');
  release();
});

// Endpoint to get teams data
app.get('/api/teams', async (req, res) => {
  try {
    const { gender } = req.query;
    console.log('Request gender:', gender);

    if (!gender) {
      return res.status(400).json({ message: 'Gender parameter is required' });
    }

    const result = await getTeamsByGender(pool, gender);
    console.log(`Found ${result.rows.length} teams`);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get single team data
app.get('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTeamById(pool, id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get standings data
app.get('/api/standings/:gender', async (req, res) => {
  try {
    const { gender } = req.params;
    const result = await getStandings(pool, gender);
    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Team Schedule
app.get('/api/teams/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query; // Optional year parameter
    
    console.log(`Schedule request for team ${id}, year: ${year || 'current'}`);
    
    const scheduleData = await getSchedule(pool, id, year || '2024-25');
    
    // Ensure we always return an array
    if (!Array.isArray(scheduleData)) {
      console.error(`Non-array schedule data returned for team ${id}`);
      return res.json([]);
    }
    
    return res.json(scheduleData);
  } catch (err) {
    console.error('Error in schedule endpoint:', err);
    return res.status(500).json([]);
  }
});

// Get all games in the schedule page
app.get('/api/games/:gender', async (req, res) => {
  try {
    const { gender } = req.params;
    const result = await getAllGames(pool, gender);
    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get Scores (Completed Games)
app.get('/api/scores/:gender', async (req, res) => {
  try {
    const { gender } = req.params;
    const result = await getScores(pool, gender);
    console.log(`Retrieved ${result.rowCount} scores for ${gender}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logo Upload endpoint
app.post('/api/teams/:id/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const result = await updateTeamLogo(pool, id, req.file.buffer);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ 
      message: 'Logo uploaded successfully',
      teamId: id
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get players for a specific team
app.get('/api/players', async (req, res) => {
  try {
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    const query = `
      SELECT id, first_name, last_name, jersey_number, position, academic_year
      FROM players
      WHERE team_id = $1
    `;
    const values = [teamId];

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});