const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getStandings } = require('./db/helpers/get_standings_helper');

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