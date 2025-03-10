const { loadQuery } = require('../../query-loader');

const getTeamsByGender = async (pool, gender) => {
  const query = await loadQuery('get_teams_by_gender');
  return pool.query(query, [gender]);
};

const getTeamById = async (pool, id) => {
  const query = await loadQuery('get_team_by_id');
  return pool.query(query, [id]);
};

const updateTeamLogo = async (pool, id, logoBuffer) => {
  const query = await loadQuery('update_team_logo');
  return pool.query(query, [logoBuffer, id]);
};

module.exports = {
  getTeamsByGender,
  getTeamById,
  updateTeamLogo
};