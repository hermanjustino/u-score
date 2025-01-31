import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/playercard.css';

const PlayerCard = ({ player }) => {
  return (
    <Link to={`/player/${player.id}`} className="player-card">
      <div className="player-photo">
        <img 
          src={player.photo_url}
          alt={`${player.first_name} ${player.last_name}`}
          onError={(e) => {
            e.target.src = '/default-player.png';
          }}
        />
      </div>
      <div className="player-info">
        <h3>{player.first_name} {player.last_name}</h3>
        <p>#{player.jersey_number} | {player.position}</p>
        <p>{player.hometown}, {player.province}</p>
      </div>
    </Link>
  );
};

export default PlayerCard;