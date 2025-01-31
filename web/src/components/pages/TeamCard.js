import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/teamcard.css';

const TeamCard = ({ team }) => {
  return (
    <Link to={`/team/${team.id}`} className="team-card">
      <h3>{team.varsity_name}</h3>
      <p>{team.university}</p>
      <p>{team.city}, {team.province}</p>
      {team.division && <p>Division: {team.division}</p>}
    </Link>
  );
};

export default TeamCard;