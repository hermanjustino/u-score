const fs = require('fs').promises;
const path = require('path');

const loadSqlFile = async (filename) => {
  const filePath = path.join(__dirname, '..', 'queries', filename);
  return await fs.readFile(filePath, 'utf8');
};

const getSchedule = async (pool, teamId) => {
  const query = await loadSqlFile('get_schedule.sql');
  return pool.query(query, [teamId]);
};

module.exports = {
  getSchedule
};