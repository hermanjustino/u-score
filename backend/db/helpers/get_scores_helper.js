const fs = require('fs').promises;
const path = require('path');

const loadSqlFile = async (filename) => {
  const filePath = path.join(__dirname, '..', 'queries', filename);
  return await fs.readFile(filePath, 'utf8');
};

const getScores = async (pool, gender) => {
  const query = await loadSqlFile('get_scores_basketball.sql');
  return pool.query(query, [gender]);
};

module.exports = {
  getScores
};