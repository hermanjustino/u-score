import React from 'react';
import GameCard from './GameCard';
import '../../assets/styles/schedule.css';

const GameList = ({ games }) => {
  if (!games.length) return <div>No games to display</div>;

  // Group games by date for better organization
  const groupedByDate = games.reduce((acc, game) => {
    const date = new Date(game.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(game);
    return acc;
  }, {});

  return (
    <div className="game-list">
      {Object.entries(groupedByDate).map(([date, gamesOnDate]) => (
        <div key={date} className="game-date-group">
          <h4 className="game-date-header">{date}</h4>
          <div className="games-for-date">
            {gamesOnDate.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameList;