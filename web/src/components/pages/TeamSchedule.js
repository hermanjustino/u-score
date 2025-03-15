import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO, isThisYear, getYear } from 'date-fns';
import '../../assets/styles/teamschedule.css';

const TeamSchedule = ({ team }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedYear, setSelectedYear] = useState('2024-25'); // Add year state
  
  // Array of available years (add more as needed)
  const availableYears = ['2024-25', '2023-24', '2022-23'];

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!team?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching schedule for ${team.university}, year: ${selectedYear}`);
        
        // Include year as a query parameter
        const response = await axios.get(`http://localhost:5001/api/teams/${team.id}/schedule`, {
          params: { year: selectedYear }
        });
        
        // Check for empty response
        if (!response.data) {
          setGames([]);
          return;
        }
        
        // Check if data is an array
        const gamesData = Array.isArray(response.data) ? response.data : [];
        
        if (gamesData.length === 0) {
          console.log('No games found in schedule data');
        } else {
          console.log(`Received ${gamesData.length} games`);
          
          // Sort games by date (most recent first)
          const sortedGames = gamesData.sort((a, b) => new Date(b.date) - new Date(a.date));
          setGames(sortedGames);
        }
      } catch (error) {
        console.error('Error fetching team schedule:', error);
        setError('Failed to load schedule');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [team?.id, selectedYear]); // Add selectedYear as a dependency

  // Year selector handler
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };
  
  // Year selector component
  const YearSelector = () => (
    <div className="year-selector">
      <label htmlFor="year-select">Season:</label>
      <select 
        id="year-select" 
        value={selectedYear} 
        onChange={handleYearChange}
      >
        {availableYears.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
  
  if (loading) return <div>Loading schedule...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  // Show "no games" message if empty
  if (!games.length) {
    return (
      <div className="team-schedule">
        <h3>{team.varsity_name} Schedule</h3>
        <YearSelector />
        <div className="no-games-message">No games scheduled for this season</div>
      </div>
    );
  }

  // Group games by month and year
  const groupedGames = games.reduce((acc, game) => {
    const gameDate = new Date(game.date);
    const monthYear = format(gameDate, 'MMMM yyyy');

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(game);
    return acc;
  }, {});

  // Sort month groups chronologically (most recent first)
  const sortedMonths = Object.keys(groupedGames).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  // Desktop view
  if (!isMobile) {
    return (
      <div className="team-schedule">
        <h3>{team.varsity_name} Schedule</h3>
        <YearSelector />
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Type</th>
              <th>Result</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const gameDate = new Date(game.date);
              const hasScore = game.status === 'final' &&
                game.team_score !== null && game.opponent_score !== null;
              const isWin = hasScore && Number(game.team_score) > Number(game.opponent_score);
              const isTie = hasScore && Number(game.team_score) === Number(game.opponent_score);

              return (
                <tr key={game.id}>
                  <td>{format(gameDate, 'MMM d, yyyy')}</td>
                  <td>
                    {game.location} {game.opponent_short}
                    {game.opponent_logo && (
                      <img
                        src={game.opponent_logo}
                        alt={`${game.opponent} logo`}
                        className="opponent-logo"
                        width="20"
                        height="20"
                      />
                    )}
                  </td>
                  <td>
                    {game.is_conference_game ? 'Conference' : 'Non-Conference'}
                    {game.is_exhibition && ' (Exhibition)'}
                  </td>
                  <td className={isWin ? 'positive' : isTie ? '' : 'negative'}>
                    {hasScore ? (isWin ? 'W' : isTie ? 'T' : 'L') : game.status === 'final' ? 'Final' : 'Scheduled'}
                  </td>
                  <td>
                    {hasScore ? `${game.team_score}-${game.opponent_score}` : '-'}
                    {game.is_overtime && ' (OT)'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile view with sticky month headers
  return (
    <div className="team-schedule mobile">
      <h3>{team.varsity_name} Schedule</h3>
      <YearSelector />
      {sortedMonths.map(monthYear => (
        <div key={monthYear} className="month-section">
          <div className="month-header">{monthYear}</div>
          <div className="games-list">
            {groupedGames[monthYear].map(game => {
              const gameDate = new Date(game.date);
              const hasScore = game.status === 'final' &&
                game.team_score !== null && game.opponent_score !== null;
              const isWin = hasScore && Number(game.team_score) > Number(game.opponent_score);
              const isTie = hasScore && Number(game.team_score) === Number(game.opponent_score);
              const result = hasScore
                ? (isWin ? 'W' : isTie ? 'T' : 'L')
                : '';

              return (
                <div key={game.id} className="game-item">
                  <div className="game-date">
                    {format(gameDate, 'd')}
                  </div>
                  <div className="game-opponent">
                    {game.location === 'vs.' ? 'vs ' : '@ '}
                    {game.opponent_short}
                  </div>
                  <div className={`game-result ${isWin ? 'positive' : isTie ? '' : 'negative'}`}>
                    {hasScore ? `${result} ${game.team_score}-${game.opponent_score}` : ''}
                    {game.is_overtime && ' OT'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamSchedule;