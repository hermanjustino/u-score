// filepath: /Users/hermanjustino/Documents/projects/u-score/backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'hermanjustino', // replace with your PostgreSQL username
  host: 'localhost',
  database: 'usports_basketball',
  password: '', // replace with your PostgreSQL password if needed
  port: 5432,
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