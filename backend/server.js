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
    const result = await pool.query('SELECT * FROM teams');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});