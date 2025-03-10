const fs = require('fs').promises;
const path = require('path');

// Cache for loaded queries
const queryCache = {};

/**
 * Loads a SQL query from the file system
 * @param {string} queryName - Name of the query file without extension
 * @returns {Promise<string>} The SQL query text
 */
async function loadQuery(queryName) {
  // Return from cache if available
  if (queryCache[queryName]) {
    return queryCache[queryName];
  }
  
  const filePath = path.join(__dirname, 'db','queries', 'basketball', `${queryName}.sql`);
  
  try {
    const queryText = await fs.readFile(filePath, 'utf8');
    // Store in cache for future use
    queryCache[queryName] = queryText;
    return queryText;
  } catch (error) {
    console.error(`Error loading query ${queryName}:`, error);
    throw new Error(`Failed to load query: ${queryName}`);
  }
}

module.exports = { loadQuery };