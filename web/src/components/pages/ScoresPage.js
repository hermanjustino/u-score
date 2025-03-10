import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, subDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import '../../assets/styles/scores.css';

const ScoresPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [allGames, setAllGames] = useState([]);
  const dateScrollRef = useRef(null);
  const { gender } = useParams();
  const navigate = useNavigate();

  const DATES_TO_SHOW = 7;

  useEffect(() => {
    const fetchAllGames = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/scores/${gender}`);
        setAllGames(response.data);
        
        // If we have games, find the closest date with games
        if (response.data.length > 0) {
          const today = startOfDay(new Date());
          const closestGameDate = findClosestDateWithGames(today, response.data);
          if (closestGameDate) {
            setSelectedDate(closestGameDate);
          }
        }
      } catch (error) {
        console.error('Error fetching all games:', error);
      }
    };
    
    fetchAllGames();
  }, [gender]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        // Filter scores for selected date from allGames
        if (allGames.length > 0) {
          const filteredScores = allGames.filter(game => 
            isSameDay(parseISO(game.date), selectedDate)
          );
          setScores(filteredScores);
          setLoading(false);
        } else {
          // Fallback if allGames isn't loaded yet
          const response = await axios.get(`http://localhost:5001/api/scores/${gender}`);
          const filteredScores = response.data.filter(game => 
            isSameDay(parseISO(game.date), selectedDate)
          );
          setScores(filteredScores);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
        setLoading(false);
      }
    };

    fetchScores();
  }, [gender, selectedDate, allGames]);

  // Helper function to find closest date with games
  const findClosestDateWithGames = (targetDate, games) => {
    // First try to find a game on the target date
    const gamesOnTarget = games.filter(game => 
      isSameDay(parseISO(game.date), targetDate)
    );
    
    if (gamesOnTarget.length > 0) {
      return targetDate;
    }
    
    // Try to find next closest date (checking forwards then backwards)
    let forwardDate = targetDate;
    let backwardDate = targetDate;
    
    for (let i = 1; i <= 30; i++) {
      // Check next day
      forwardDate = addDays(forwardDate, 1);
      const forwardGames = games.filter(game => 
        isSameDay(parseISO(game.date), forwardDate)
      );
      
      if (forwardGames.length > 0) {
        return forwardDate;
      }
      
      // Check previous day
      backwardDate = subDays(backwardDate, 1);
      const backwardGames = games.filter(game => 
        isSameDay(parseISO(game.date), backwardDate)
      );
      
      if (backwardGames.length > 0) {
        return backwardDate;
      }
    }
    
    return null;
  };

  // Get unique dates that have games
  const getDatesWithGames = () => {
    const uniqueDates = [];
    const dateStrings = new Set();
    
    allGames.forEach(game => {
      const gameDate = parseISO(game.date);
      const dateStr = gameDate.toISOString().split('T')[0];
      
      if (!dateStrings.has(dateStr)) {
        dateStrings.add(dateStr);
        uniqueDates.push(gameDate);
      }
    });
    
    // Sort dates chronologically
    return uniqueDates.sort((a, b) => a.getTime() - b.getTime());
  };
  
  // Get dates with games
  const gameDates = getDatesWithGames();
  
  // Find current date index
  const selectedDateIndex = gameDates.findIndex(date => 
    isSameDay(date, selectedDate)
  );

  // Scroll date navigation
  const scrollDates = (direction) => {
    if (gameDates.length === 0) return;
    
    // Find current index
    const currentIndex = selectedDateIndex !== -1 ? selectedDateIndex : 0;
    
    // Calculate new index
    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, gameDates.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    // Set the new date
    setSelectedDate(gameDates[newIndex]);
  };

  // Get visible dates
  const getVisibleDates = () => {
    if (gameDates.length === 0) return [];
    
    // If selected date isn't in our game dates, use first date
    const activeIndex = selectedDateIndex !== -1 ? selectedDateIndex : 0;
    
    // Calculate how many dates to show on each side
    const datesOnEachSide = Math.floor(DATES_TO_SHOW / 2);
    
    // Calculate start index
    let startIdx = Math.max(0, activeIndex - datesOnEachSide);
    
    // Adjust if we're close to the end
    if (startIdx + DATES_TO_SHOW > gameDates.length) {
      startIdx = Math.max(0, gameDates.length - DATES_TO_SHOW);
    }
    
    // Return slice of visible dates
    return gameDates.slice(startIdx, startIdx + DATES_TO_SHOW);
  };

  // Simulate top performers (since we don't have player data yet)
  const getSimulatedTopPerformer = (teamId) => {
    const names = [
      'M. Johnson', 'J. Smith', 'K. Williams', 'T. Davis', 'D. Brown', 
      'A. Miller', 'C. Wilson', 'R. Thompson', 'S. Martinez', 'N. Garcia'
    ];
    
    const stats = [
      { pts: 18, reb: 5, ast: 7 },
      { pts: 22, reb: 8, ast: 2 },
      { pts: 15, reb: 12, ast: 3 },
      { pts: 24, reb: 4, ast: 6 },
      { pts: 17, reb: 7, ast: 9 }
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomStat = stats[Math.floor(Math.random() * stats.length)];
    
    return {
      name: randomName,
      pts: randomStat.pts,
      reb: randomStat.reb,
      ast: randomStat.ast
    };
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  if (loading) return <div className="loading-container">Loading scores...</div>;

  const visibleDates = getVisibleDates();
  const canScrollPrev = selectedDateIndex > 0;
  const canScrollNext = selectedDateIndex < gameDates.length - 1;

  return (
    <div className="scoreboard-container">
      {/* Header Bar */}
      <div className="scoreboard-header">
        <h2 className="scoreboard-title">{gender.charAt(0).toUpperCase() + gender.slice(1)}'s Basketball Scoreboard</h2>
        <button 
          className="calendar-button"
          onClick={() => setDatePickerOpen(true)}
          aria-label="Open date picker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="date-navigation">
        <button 
          className="date-nav-arrows scroll-left"
          onClick={() => scrollDates('prev')}
          disabled={!canScrollPrev}
          aria-label="Previous dates"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
        
        <div className="dates-scroll-container" ref={dateScrollRef}>
          {visibleDates.map((date) => (
            <button
              key={date.toISOString()}
              className={`date-option ${isSameDay(date, selectedDate) ? 'active' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              {format(date, 'MMM d')}
            </button>
          ))}
          {visibleDates.length === 0 && (
            <div className="no-games-message small">No scheduled games found</div>
          )}
        </div>
        
        <button 
          className="date-nav-arrows scroll-right"
          onClick={() => scrollDates('next')}
          disabled={!canScrollNext}
          aria-label="Next dates"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* Scores Content */}
      <div className="scores-container">
        {scores.length > 0 ? (
          scores.map(game => {
            const homeWinner = game.home_team_score > game.away_team_score;
            const homePerformer = getSimulatedTopPerformer(game.home_team_id);
            const awayPerformer = getSimulatedTopPerformer(game.away_team_id);
            
            return (
              <div key={game.id} className="score-row">
                <div className="score-main">
                  <div className="score-header">
                    <div className="game-status">
                      {game.status === 'final' ? 'Final' : 'Scheduled'}
                      {game.is_overtime && ' (OT)'}
                    </div>
                    <div className="column-header">T</div>
                  </div>
                  
                  <div className={`team-row ${homeWinner ? 'winner' : 'loser'}`}>
                    <div className="team-info">
                      {game.home_logo && (
                        <img 
                          src={game.home_logo} 
                          alt={`${game.home_university} logo`} 
                          className="team-logo"
                        />
                      )}
                      <div className="team-name">{game.home_university}</div>
                    </div>
                    <div className="team-score">{game.home_team_score}</div>
                  </div>
                  
                  <div className={`team-row ${!homeWinner ? 'winner' : 'loser'}`}>
                    <div className="team-info">
                      {game.away_logo && (
                        <img 
                          src={game.away_logo} 
                          alt={`${game.away_university} logo`} 
                          className="team-logo"
                        />
                      )}
                      <div className="team-name">{game.away_university}</div>
                    </div>
                    <div className="team-score">{game.away_team_score}</div>
                  </div>
                </div>
                
                <div className="top-performers">
                  <div className="performers-header">Top Performers</div>
                  
                  <div className="performer">
                    <div className="performer-name">{homePerformer.name}</div>
                    <div className="performer-team">{game.home_team}</div>
                    <div className="performer-stats">
                      {homePerformer.pts} pts, {homePerformer.reb} reb, {homePerformer.ast} ast
                    </div>
                  </div>
                  
                  <div className="performer">
                    <div className="performer-name">{awayPerformer.name}</div>
                    <div className="performer-team">{game.away_team}</div>
                    <div className="performer-stats">
                      {awayPerformer.pts} pts, {awayPerformer.reb} reb, {awayPerformer.ast} ast
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-games-message">
            No games found for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        )}
      </div>

      {/* Date Picker Overlay */}
      {datePickerOpen && (
        <div className="date-picker-overlay" onClick={() => setDatePickerOpen(false)}>
          <div className="date-picker-container" onClick={e => e.stopPropagation()}>
            <div className="date-picker-header">
              <h3 className="date-picker-title">Select a Date</h3>
              <button 
                className="date-picker-close" 
                onClick={() => setDatePickerOpen(false)}
                aria-label="Close date picker"
              >
                ×
              </button>
            </div>
            <div className="date-picker-content">
              {gameDates.map(date => (
                <button
                  key={date.toISOString()}
                  className={`date-option ${isSameDay(date, selectedDate) ? 'active' : ''}`}
                  style={{ display: 'block', width: '100%', padding: '12px' }}
                  onClick={() => handleDateSelect(date)}
                >
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </button>
              ))}
              {gameDates.length === 0 && (
                <div className="no-games-message">No games scheduled</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoresPage;