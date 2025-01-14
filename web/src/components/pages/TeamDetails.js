import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/teamdetails.css';

const TeamDetails = () => {
  const [team, setTeam] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/teams/${id}`);
        setTeam(response.data);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    fetchTeam();
  }, [id]);

  if (!team) return <div>Loading...</div>;

  return (
    <div className="team-details">
      <h2>{team.university} {team.varsity_name}</h2>
      <div className="team-info">
        <p><strong>Location:</strong> {team.city}, {team.province}</p>
        <p><strong>Founded:</strong> {team.founded}</p>
        <p><strong>Arena:</strong> {team.arena}</p>
        <p><strong>Capacity:</strong> {team.capacity}</p>
        <p><strong>Conference:</strong> {team.conference}</p>
        {team.division && <p><strong>Division:</strong> {team.division}</p>}
      </div>
    </div>
  );
};

export default TeamDetails;