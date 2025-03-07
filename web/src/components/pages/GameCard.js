import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {
  const date = new Date(game.date).toLocaleDateString();
  const time = new Date(game.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const isFinal = game.status === 'final';
  const isExhibition = game.is_exhibition;

  return (
    <div className={`game-card ${isExhibition ? 'exhibition-game' : ''}`}>
      <div className="game-date-time">
        <span className="game-time">{time}</span>
        {isExhibition && <span className="exhibition-label">Exhibition</span>}
      </div>
      <div className="game-teams">
        <div className="team home">
          <Link to={`/team/${game.home_team_id}`}>{game.home_university} {game.home_team}</Link>
          {isFinal && <span className="score">{game.home_team_score}</span>}
        </div>
        <div className="team away">
          <Link to={`/team/${game.away_team_id}`}>{game.away_university} {game.away_team}</Link>
          {isFinal && <span className="score">{game.away_team_score}</span>}
        </div>
      </div>
      <div className="game-info">
        {game.is_conference_game ? 'Conference Game' : 'Non-Conference'}
      </div>
    </div>
  );
};

export default GameCard;