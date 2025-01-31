import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/teams.css';
import TeamCard from './TeamCard';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConference, setSelectedConference] = useState('All Conferences');
  const { gender } = useParams();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        if (!gender || !['men', 'women'].includes(gender)) {
          setError('Invalid gender parameter');
          return;
        }

        const response = await axios.get(`http://localhost:5001/api/teams?gender=${gender}`);
        setTeams(response.data);
      } catch (error) {
        console.error('Error fetching teams data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [gender]);

  if (!gender || !['men', 'women'].includes(gender)) {
    return <Navigate to="/" />;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const conferences = ['All Conferences', ...new Set(teams.map(team => team.conference))];
  
  const filteredTeams = selectedConference === 'All Conferences' 
    ? teams 
    : teams.filter(team => team.conference === selectedConference);

  const groupedTeams = filteredTeams.reduce((acc, team) => {
    const conference = team.conference;
    if (!acc[conference]) {
      acc[conference] = [];
    }
    acc[conference].push(team);
    return acc;
  }, {});

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>{gender.charAt(0).toUpperCase() + gender.slice(1)}'s Teams</h1>
        <select 
          value={selectedConference} 
          onChange={(e) => setSelectedConference(e.target.value)}
          className="conference-select"
        >
          {conferences.map(conference => (
            <option key={conference} value={conference}>
              {conference}
            </option>
          ))}
        </select>
      </div>

      {Object.entries(groupedTeams).map(([conference, conferenceTeams]) => (
        <div key={conference} className="conference-section">
          <h2>{conference}</h2>
          <div className="teams-grid">
            {conferenceTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Teams;