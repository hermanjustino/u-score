const { loadQuery } = require('../../query-loader');

/**
 * Get schedule data for a specific team
 * @param {object} pool - PostgreSQL connection pool
 * @param {number} teamId - Team ID to fetch schedule for
 * @returns {Promise<object>} Query result with schedule data
 */
const getSchedule = async (pool, teamId) => {
  const query = await loadQuery('get_schedule');
  return pool.query(query, [teamId]);
};

module.exports = {
  getSchedule
};