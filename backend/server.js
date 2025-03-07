const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getStandings } = require('./db/helpers/get_standings_helper');
const { getSchedule } = require('./db/helpers/get_schedule_helper');
const { getAllGames } = require('./db/helpers/get_games_helper');
const { getScores } = require('./db/helpers/get_scores_helper');

const app = express();
const port = 5001;

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
    console.log('Request gender:', gender); // Debug log

    if (!gender) {
      return res.status(400).json({ message: 'Gender parameter is required' });
    }

    const query = {
      text: 'SELECT * FROM teams WHERE gender = $1 ORDER BY conference, university',
      values: [gender],
    };

    console.log('Executing query:', query); // Debug log
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} teams`); // Debug log

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
    const result = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [id]
    );

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
    const result = await getSchedule(pool, id);
    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
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

// Logo Upload
const multer = require('multer');
const upload = multer();

// Logo Upload endpoint
app.post('/api/teams/:id/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Log file info
    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Update team with logo
    const result = await pool.query(
      'UPDATE teams SET logo = $1 WHERE id = $2 RETURNING id',
      [req.file.buffer, id]
    );

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