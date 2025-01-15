const fs = require('fs').promises;
const path = require('path');

const loadSqlFile = async (filename) => {
  const filePath = path.join(__dirname, '..', 'queries', filename);
  return await fs.readFile(filePath, 'utf8');
};

const getStandings = async (pool, gender) => {
  const query = await loadSqlFile('get_standings.sql');
  return pool.query(query, [gender]);
};

module.exports = {
  getStandings
};