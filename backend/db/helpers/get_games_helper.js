const { loadQuery } = require('../../query-loader');

const getAllGames = async (pool, gender) => {
  const query = await loadQuery('get_all_schedules_basketball');
  return pool.query(query, [gender]);
};

module.exports = {
  getAllGames
};