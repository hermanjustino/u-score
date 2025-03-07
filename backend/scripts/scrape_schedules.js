const axios = require('axios');
const xml2js = require('xml2js');
const { Pool } = require('pg');
const fs = require('fs');
const teamMappings = require('./team_mappings');

// Create log file
const logStream = fs.createWriteStream('scraper_log.txt', {flags: 'w'});
const log = (message) => {
  // Only show summary messages in console
  if (message.startsWith('Starting') || 
      message.startsWith('Done!') || 
      message.startsWith('Error scraping')) {
    console.log(message);
  }
  // Write all messages to log file
  logStream.write(message + '\n');
};

// DB connection
const pool = new Pool({
  user: 'hermanjustino',
  host: 'localhost',
  database: 'usports_basketball',
  password: '',
  port: 5432,
});

// Get gender from team name
const getGender = (teamName) => {
  const lowerName = teamName.toLowerCase();
  if (lowerName.includes('women') || lowerName.includes('pandas') || 
      lowerName.includes('axewomen') || lowerName.includes('x-women')) {
    return 'women';
  }
  return 'men';
};

// Extract data from the match description
const parseGameInfo = (item) => {
  const description = item.description || '';
  const title = item.title || '';
  
  // Check if game is TBD
  if (description.includes('TBD')) {
    return null;
  }
  
  // Parse completed games with scores in title: "TeamA, TeamB, 80-75"
  const titleScoreRegex = /^(.+?),\s*(.+?),\s*(\d+)-(\d+)$/i;
  const titleMatch = title.match(titleScoreRegex);
  
  if (titleMatch) {
    const homeTeam = titleMatch[1].trim();
    const awayTeam = titleMatch[2].trim(); 
    const homeScore = parseInt(titleMatch[3]);
    const awayScore = parseInt(titleMatch[4]);
    
    // Check if game went to overtime
    const isOvertime = description.toLowerCase().includes('ot');
    
    return {
      homeTeamName: homeTeam,
      homeScore: homeScore,
      awayTeamName: awayTeam,
      awayScore: awayScore,
      status: 'final',
      isOvertime: isOvertime
    };
  }
  
  // Parse scheduled games without scores: "TeamA at TeamB"
  const scheduledTitleRegex = /^(.+?)\s+(?:at|vs\.?|@)\s+(.+?)$/i;
  const scheduledMatch = title.match(scheduledTitleRegex);
  
  if (scheduledMatch) {
    const awayTeam = scheduledMatch[1].trim();
    const homeTeam = scheduledMatch[2].trim();
    
    return {
      homeTeamName: homeTeam,
      homeScore: 0,
      awayTeamName: awayTeam,
      awayScore: 0,
      status: 'scheduled',
      isOvertime: false
    };
  }
  
  // For games in description but not in title format
  // Extract from description if needed for edge cases
  if (description.includes('Basketball on')) {
    const descTeamsRegex = /.*:\s*(.+?),\s*(.+?)(?:,\s*|\s*$)/i;
    const descTeamsMatch = description.match(descTeamsRegex);
    
    if (descTeamsMatch) {
      const team1 = descTeamsMatch[1].trim();
      const team2 = descTeamsMatch[2].trim();
      
      // Use ps:opponent to determine home/away
      let homeTeamName, awayTeamName;
      
      if (item['ps:opponent'] && item['ps:opponent'].startsWith('at ')) {
        const opponentName = item['ps:opponent'].substring(3).trim();
        homeTeamName = opponentName;
        awayTeamName = team1;
      } else {
        // Default to first team as home if we can't determine
        homeTeamName = team1;
        awayTeamName = team2;
      }
      
      const isFinal = description.toLowerCase().includes('final');
      const isOvertime = description.toLowerCase().includes('ot');
      
      // Check for scores in description
      const scoreRegex = /final(?:\s*-\s*\w+)?,\s*(\d+)-(\d+)/i;
      const scoreMatch = description.match(scoreRegex);
      
      if (scoreMatch && isFinal) {
        return {
          homeTeamName,
          homeScore: parseInt(scoreMatch[1]),
          awayTeamName,
          awayScore: parseInt(scoreMatch[2]),
          status: 'final',
          isOvertime
        };
      }
      
      return {
        homeTeamName,
        homeScore: 0,
        awayTeamName,
        awayScore: 0,
        status: isFinal ? 'final' : 'scheduled',
        isOvertime
      };
    }
  }
  
  // Couldn't parse this format
  return null;
};

// Check if a game is an exhibition game based on description or title
const isExhibitionGame = (item) => {
  const description = item.description || '';
  const title = item.title || '';
  const guid = item.guid || '';

  // Check if the game is from exhibition feed
  if (guid.includes('/2023-24/schedule')) {
    return true;
  }

  // Check description for exhibition markers
  const exhibitionTerms = [
    'exhibition', 
    'ncaa division', 
    'non-conference', 
    'preseason',
    'pre-season'
  ];

  const lowerDesc = description.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  return exhibitionTerms.some(term => 
    lowerDesc.includes(term) || lowerTitle.includes(term)
  );
};


// Update the scrapeAndImportGames function:

async function scrapeAndImportGames() {
  try {
    log('Starting schedule scraping...');
    
    // Fetch RSS feed
    const response = await axios.get('https://en.usports.ca/sports/mbkb/composite?print=rss');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    
    const items = result.rss.channel.item || [];
    
    log(`Found ${items.length} games in the feed`);
    
    // Get all teams for mapping
    const teamsResult = await pool.query('SELECT id, varsity_name, gender FROM teams');
    
    // Create normalized team name lookup
    const teamsByNameAndGender = {};
    
    teamsResult.rows.forEach(team => {
      const gender = team.gender;
      const teamName = team.varsity_name;
      
      // Add this team by its full name
      if (!teamsByNameAndGender[gender]) {
        teamsByNameAndGender[gender] = {};
      }
      teamsByNameAndGender[gender][teamName.toLowerCase()] = team.id;
    });
    
    log(`Found ${teamsResult.rows.length} teams in database`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    let tbd_count = 0;
    
    // Process each game
    for (const item of items) {
      const title = item.title;
      const description = item.description;
      
      // Skip TBD games
      if (description && description.includes('TBD')) {
        tbd_count++;
        continue;
      }
      
      // Determine gender from description or category
      const gameGender = (item.category && item.category.includes('Women')) || 
                     (description && description.toLowerCase().includes('women')) ? 'women' : 'men';
      
      // Log sample data for debugging
      if (skippedCount < 5 && insertedCount < 10) {
        log(`Sample item: ${title}`);
        log(`Description: ${description}`);
      }
      
      const gameInfo = parseGameInfo(item);
      
      if (!gameInfo) {
        log(`Skipping item, couldn't parse: ${title} / ${description}`);
        skippedCount++;
        continue;
      }
      
      const { homeTeamName, homeScore, awayTeamName, awayScore, status, isOvertime } = gameInfo;
      
      // Find team IDs using mappings
      let homeTeamId = null;
      let awayTeamId = null;
      
      // Try to map team names using team_mappings.js
      for (const [pattern, varsityName] of Object.entries(teamMappings)) {
        if (homeTeamName.toLowerCase().includes(pattern)) {
          const genderMap = teamsByNameAndGender[gameGender] || {};
          homeTeamId = genderMap[varsityName.toLowerCase()];
          if (homeTeamId) break;
        }
      }
      
      for (const [pattern, varsityName] of Object.entries(teamMappings)) {
        if (awayTeamName.toLowerCase().includes(pattern)) {
          const genderMap = teamsByNameAndGender[gameGender] || {};
          awayTeamId = genderMap[varsityName.toLowerCase()];
          if (awayTeamId) break;
        }
      }
      
      if (!homeTeamId || !awayTeamId) {
        log(`Skipping game, couldn't find team: ${homeTeamName} or ${awayTeamName}`);
        log(`  - Home team "${homeTeamName}" maps to ID: ${homeTeamId}`);
        log(`  - Away team "${awayTeamName}" maps to ID: ${awayTeamId}`);
        skippedCount++;
        continue;
      }
      
      // Extract and format date
      const gameDate = new Date(item.pubDate).toISOString();
      
      // Determine if conference game
      const homeTeamQuery = await pool.query('SELECT conference FROM teams WHERE id = $1', [homeTeamId]);
      const awayTeamQuery = await pool.query('SELECT conference FROM teams WHERE id = $1', [awayTeamId]);
      const isConference = homeTeamQuery.rows[0].conference === awayTeamQuery.rows[0].conference;
      
      // Check if game already exists
      try {
        const checkResult = await pool.query(
          `SELECT id FROM games 
           WHERE home_team_id = $1 AND away_team_id = $2 AND date::date = $3::date`,
          [homeTeamId, awayTeamId, gameDate]
        );

        if (checkResult.rows.length > 0) {
          // Update existing game
          const updateResult = await pool.query(
            `UPDATE games 
             SET home_team_score = $1, 
                 away_team_score = $2,
                 status = $3,
                 is_conference_game = $4,
                 is_overtime = $5
             WHERE id = $6
             RETURNING id`,
            [homeScore, awayScore, status, isConference, isOvertime, checkResult.rows[0].id]
          );
          log(`Updated existing game: ${homeTeamName} vs ${awayTeamName}`);
        } else {
          // Insert new game
          const insertResult = await pool.query(
            `INSERT INTO games 
             (date, home_team_id, away_team_id, home_team_score, away_team_score, 
              status, is_conference_game, gender, is_overtime)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [gameDate, homeTeamId, awayTeamId, homeScore, awayScore, 
             status, isConference, gameGender, isOvertime]
          );
          log(`Inserted new game: ${homeTeamName} vs ${awayTeamName}`);
        }
        insertedCount++;
      } catch (err) {
        log(`Error with game ${homeTeamName} vs ${awayTeamName}: ${err.message}`);
        log(`Game details: Date=${gameDate}, HomeID=${homeTeamId}, AwayID=${awayTeamId}`);
        skippedCount++;
      }
    }
    
    log(`Done! Inserted/updated ${insertedCount} games. Skipped ${skippedCount} games. TBD games: ${tbd_count}`);
  } catch (error) {
    log(`Error scraping schedule: ${error}`);
  } finally {
    pool.end();
    logStream.end();
  }
}

// Run the script
scrapeAndImportGames();

module.exports = { scrapeAndImportGames };