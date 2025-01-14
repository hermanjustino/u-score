import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/teams');
        setTeams(response.data);
      } catch (error) {
        console.error('Error fetching teams data:', error);
      }
    };

    fetchTeams();
  }, []);

  const groupedTeams = teams.reduce((acc, team) => {
    const conference = team.conference;
    if (!acc[conference]) {
      acc[conference] = [];
    }
    acc[conference].push(team);
    return acc;
  }, {});

  return (
    <div className="teams-container">
      {Object.entries(groupedTeams).map(([conference, conferenceTeams]) => (
        <div key={conference} className="conference-section">
          <h2>{conference}</h2>
          <div className="teams-grid">
            {conferenceTeams.map((team) => (
              <Link 
                to={`/team/${team.id}`} 
                key={team.id} 
                className="team-card"
              >
                <h3>{team.varsity_name}</h3>
                <p>{team.university}</p>
                <p>{team.city}, {team.province}</p>
                {team.division && <p>Division: {team.division}</p>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Teams;