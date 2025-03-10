const { loadQuery } = require('../../query-loader');

/**
 * Get standings data for a specific gender
 * @param {object} pool - PostgreSQL connection pool
 * @param {string} gender - 'men' or 'women'
 * @returns {Promise<object>} Query result with standings data
 */
const getStandings = async (pool, gender) => {
  const query = await loadQuery('get_standings');
  return pool.query(query, [gender]);
};

module.exports = {
  getStandings
};