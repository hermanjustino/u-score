import React from 'react';
import GameCard from './GameCard';

const GameList = ({ games }) => {
  if (!games.length) return <div>No games to display</div>;

  return (
    <div className="game-list">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameList;