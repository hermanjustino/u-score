const { loadQuery } = require('../../query-loader');

const getScores = async (pool, gender) => {
  const query = await loadQuery('get_scores_basketball');
  return pool.query(query, [gender]);
};

module.exports = {
  getScores
};