import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  return (
    <div>
      <h1>Teams</h1>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            {team.university} - {team.varsity_name} ({team.city}, {team.province})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Teams;