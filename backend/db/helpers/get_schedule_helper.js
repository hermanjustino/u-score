const { loadQuery } = require('../../query-loader');
const { getTeamScheduleFromUSports } = require('../../utils/rss_parser');

// Cache for team data to avoid repeated DB lookups
let teamCache = {};

/**
 * Get schedule data for a specific team
 * @param {object} pool - PostgreSQL connection pool
 * @param {string} gender - 'men' or 'women'
 * @param {number} teamId - Team ID to fetch schedule for
 * @param {string} year - Season year (optional)
 * @returns {Promise<Array>} Array of schedule data
 */

async function buildTeamConferenceMapping(pool, gender) {
  if (teamCache[gender]) {
    return teamCache[gender];
  }
  
  const query = await loadQuery('get_teams_by_gender');
  const result = await pool.query(query, [gender]);
  
  const mapping = {};
  result.rows.forEach(team => {
    // Add entries for various forms of the team name
    if (team.university) {
      mapping[team.university.toLowerCase()] = {
        id: team.id,
        conference: team.conference
      };
    }
    if (team.varsity_name) {
      mapping[team.varsity_name.toLowerCase()] = {
        id: team.id,
        conference: team.conference
      };
    }
    if (team.short_name) {
      mapping[team.short_name.toLowerCase()] = {
        id: team.id,
        conference: team.conference
      };
    }
  });
  
  teamCache[gender] = mapping;
  return mapping;
}

const getSchedule = async (pool, teamId, year = '2024-25') => {
  try {
    // First get the team details including usports_id
    const teamQuery = await loadQuery('get_team_by_id');
    const teamResult = await pool.query(teamQuery, [teamId]);
    
    if (teamResult.rows.length === 0) {
      console.error(`Team with ID ${teamId} not found`);
      return []; // Return empty array instead of throwing
    }
    
    const team = teamResult.rows[0];
    console.log(`Retrieved team: ${team.university}, gender: ${team.gender}, usports_id: ${team.usports_id}`);
    
    // Build a mapping of team names to their conference information
    const teamMapping = await buildTeamConferenceMapping(pool, team.gender);
    
    // If we have a usports_id, fetch from the RSS feed
    if (team.usports_id) {
      console.log(`Fetching schedule for ${team.university} from U Sports RSS feed for ${year}`);
      try {
        const rssData = await getTeamScheduleFromUSports(team.usports_id, team.gender, year);
        // Double-check we have an array and it's not empty
        if (Array.isArray(rssData) && rssData.length > 0) {
          console.log(`Successfully retrieved ${rssData.length} games from RSS feed`);
          
          // Add team name to each game record since RSS feed doesn't always include it
          return rssData.map(game => {
            // Determine if this is a conference game by checking if the opponent is in the same conference
            let isConferenceGame = false;
            
            // Clean up opponent name to help with matching
            const cleanOpponentName = game.opponent.replace(/^at\s+/, '').trim().toLowerCase();
            
            // Try to find the opponent in our team mapping
            for (const [teamName, teamInfo] of Object.entries(teamMapping)) {
              if (teamName.includes(cleanOpponentName) || 
                  cleanOpponentName.includes(teamName) ||
                  cleanOpponentName.split(' ').some(word => teamName.includes(word))) {
                isConferenceGame = teamInfo.conference === team.conference;
                break;
              }
            }
            
            return {
              ...game,
              team_name: team.university,
              varsity_name: team.varsity_name,
              home_team: game.location === 'vs.' ? team.university : game.home_team,
              away_team: game.location === '@' ? team.university : game.away_team,
              is_conference_game: isConferenceGame // Use our computed value
            };
          });
        }
        
        console.log(`No games found in RSS feed for ${year}, falling back to database`);
      } catch (rssError) {
        console.error(`Error with RSS feed for ${year}, falling back to database:`, rssError);
      }
    }
    
    // Fallback to database if no usports_id or RSS feed failed
    console.log(`Using database for team ${teamId} schedule`);
    const query = await loadQuery('get_schedule');
    const result = await pool.query(query, [teamId]);
    return result.rows;
  } catch (error) {
    console.error(`Error getting schedule for team ${teamId}:`, error);
    return []; // Return empty array
  }
};

module.exports = {
  getSchedule
};