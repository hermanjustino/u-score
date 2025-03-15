const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Fetches and parses U Sports RSS feed for a team's schedule
 * @param {string} teamId - The U Sports team ID
 * @param {string} gender - 'men' or 'women'
 * @param {string} year - Season year (optional)
 * @returns {Promise<Array>} Parsed schedule data
 */
async function getTeamScheduleFromUSports(teamId, gender, year = '2024-25') {
  try {
    const sportCode = gender === 'men' ? 'mbkb' : 'wbkb';
    const url = `https://en.usports.ca/sports/${sportCode}/${year}/schedule?print=rss&teamId=${teamId}`;
    
    console.log(`Fetching schedule from: ${url}`);
    const response = await axios.get(url);
    
    // Check if response data is empty or invalid
    if (!response.data || typeof response.data !== 'string' || response.data.trim() === '') {
      console.log(`Empty or invalid response for team ID ${teamId}`);
      return [];
    }
    
    // Configure XML parser with appropriate namespace handling
    const parser = new xml2js.Parser({ 
      explicitArray: false, 
      mergeAttrs: true,
      normalizeTags: false,
      xmlns: false // Disable namespace processing
    });
    
    // Try to parse the XML
    let result;
    try {
      result = await parser.parseStringPromise(response.data);
    } catch (parseError) {
      console.error(`Error parsing XML for team ID ${teamId}:`, parseError);
      return [];
    }
    
    if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
      console.log('No schedule items found in feed');
      return [];
    }
    
    // Handle both single item and arrays
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item];
    
    console.log(`Found ${items.length} games in RSS feed`);
    
    // Transform RSS items into app-friendly format
    return items.map(item => {
      // Extract data from fields
      const title = item.title || '';
      const description = item.description || '';
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const dcDate = item['dc:date'] ? new Date(item['dc:date']) : pubDate;
      
      // Get values from namespaced elements safely
      const psScore = getNamespacedValue(item, 'ps:score') || '';
      const psOpponent = getNamespacedValue(item, 'ps:opponent') || '';
      
      // Initialize variables
      let homeTeam, awayTeam, homeScore, awayScore;
      let status = 'scheduled';
      
      // Determine if this is a home game
      const isHomeGame = !(typeof psOpponent === 'string' && psOpponent.startsWith('at '));
      
      // Parse the title to get teams and scores
      if (title.includes('Final')) {
        status = 'final';
        // Remove "Final" from the title
        const gameTitle = title.replace(' Final', '');
        
        // Parse title format: "Team A XX, Team B YY"
        const parts = gameTitle.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
          // Parse team names and scores
          const team1Parts = parts[0].split(' ');
          let team1Score = null;
          if (/^\d+$/.test(team1Parts[team1Parts.length-1])) {
            team1Score = parseInt(team1Parts.pop(), 10);
          }
          const team1Name = team1Parts.join(' ');
          
          const team2Parts = parts[1].split(' ');
          let team2Score = null;
          if (/^\d+$/.test(team2Parts[team2Parts.length-1])) {
            team2Score = parseInt(team2Parts.pop(), 10);
          }
          const team2Name = team2Parts.join(' ');
          
          // Extract the host team name from the description
          const hostMatch = description.match(/Basketball on [^:]+:[^,]+,\s*([^,]+)\s*vs\.\s*([^,]+)/i);
          let hostTeam = null;
          let guestTeam = null;
          
          if (hostMatch) {
            hostTeam = hostMatch[1].trim();
            guestTeam = hostMatch[2].trim();
          }
          
          // Determine teams based on title and description
          if (title.includes(team1Name) && title.includes(team2Name)) {
            // Check which team matches current team from channel title
            const channelTitle = result.rss.channel.title || '';
            const isTeam1Current = channelTitle.includes(team1Name);
            
            if (isTeam1Current || team1Name.includes('Acadia')) {
              // Team 1 is current team
              homeTeam = isHomeGame ? team1Name : team2Name;
              awayTeam = isHomeGame ? team2Name : team1Name;
              homeScore = isHomeGame ? team1Score : team2Score;
              awayScore = isHomeGame ? team2Score : team1Score;
            } else {
              // Team 2 is current team
              homeTeam = isHomeGame ? team2Name : team1Name;
              awayTeam = isHomeGame ? team1Name : team2Name;
              homeScore = isHomeGame ? team2Score : team1Score;
              awayScore = isHomeGame ? team1Score : team2Score;
            }
          }
        }
      }
      
      // Extract scores from ps:score if we don't have them
      // Format is typically "W, XX-YY" or "L, XX-YY"
      if (psScore && (!homeScore || !awayScore)) {
        const scoreMatch = typeof psScore === 'string' ? psScore.match(/[WL],\s*(\d+)-(\d+)/) : null;
        if (scoreMatch) {
          const score1 = parseInt(scoreMatch[1], 10);
          const score2 = parseInt(scoreMatch[2], 10);
          const isWin = psScore.startsWith('W');
          
          if (isHomeGame) {
            homeScore = isWin ? score1 : score2;
            awayScore = isWin ? score2 : score1;
          } else {
            awayScore = isWin ? score1 : score2;
            homeScore = isWin ? score2 : score1;
          }
        }
      }
      
      // Extract date and venue
      let gameDate = dcDate;
      const dateLine = description.match(/on ([^,]+) at ([^:]+)/);
      if (dateLine) {
        const dateStr = dateLine[1];
        const timeStr = dateLine[2].trim();
        const fullDateStr = `${dateStr} ${timeStr} ${year.split('-')[0]}`;
        const parsedDate = new Date(fullDateStr);
        if (!isNaN(parsedDate.getTime())) {
          gameDate = parsedDate;
        }
      }
      
      // Extract venue if available
      let venue = '';
      const venueMatch = description.match(/Venue:\s*([^,<]+)/i);
      if (venueMatch) {
        venue = venueMatch[1].trim();
      }
      
      // Check for special game types
      const isConference = false;
      const isExhibition = description.toLowerCase().includes('exhibition');
      const isOvertime = description.toLowerCase().includes('ot') ||
                      description.toLowerCase().includes('overtime');
      
      // Generate an ID
      const id = item.guid ? 
        (typeof item.guid === 'string' ? item.guid.replace(/.*#/, '') : Math.random().toString(36).substring(2)) : 
        `game-${gameDate.toISOString()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Format opponent name
      let opponent = '';
      if (typeof psOpponent === 'string') {
        opponent = psOpponent.replace(/^at\s+/, '').trim();
      } else if (isHomeGame) {
        opponent = awayTeam;
      } else {
        opponent = homeTeam;
      }
      
      return {
        id,
        date: gameDate.toISOString(),
        home_team: homeTeam,
        away_team: awayTeam,
        home_team_score: homeScore || null,
        away_team_score: awayScore || null,
        status,
        is_conference_game: isConference,
        is_exhibition: isExhibition,
        is_overtime: isOvertime,
        venue,
        
        // Fields for team-specific view
        location: isHomeGame ? 'vs.' : '@',
        opponent: opponent,
        opponent_short: opponent,
        team_score: isHomeGame ? homeScore : awayScore,
        opponent_score: isHomeGame ? awayScore : homeScore
      };
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
}

/**
 * Safely extracts a namespaced value from an XML element
 * @param {Object} item - The XML element object
 * @param {string} key - The namespaced key to extract
 * @returns {string|null} The value or null if not found
 */
function getNamespacedValue(item, key) {
  // Try different ways the key might be represented
  if (item[key] !== undefined) return item[key];
  
  // Look for ps:score and ps:opponent in various formats
  const keys = Object.keys(item);
  const matchingKey = keys.find(k => 
    k === key || 
    k.endsWith(':' + key.split(':')[1]) || 
    k.endsWith('$' + key.split(':')[1])
  );
  
  return matchingKey ? item[matchingKey] : null;
}

module.exports = { getTeamScheduleFromUSports };