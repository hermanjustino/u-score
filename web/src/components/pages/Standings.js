import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/standings.css';

const StandingsTable = ({ teams }) => (
  <table className="standings-table">
    <thead>
      <tr>
        <th className="team-column">Team</th>
        <th>W</th>
        <th>L</th>
        <th>PCT</th>
        <th>PF</th>
        <th>PA</th>
        <th>DIFF</th>
      </tr>
    </thead>
    <tbody>
      {teams.map((team) => {
        const winPct = team.games_played ?
          ((team.wins / team.games_played) * 100).toFixed(1) : '0.0';
        const pointDiff = team.points_for - team.points_against;

        return (
          <tr key={team.id}>
            <td className="team-column">
              <Link to={`/team/${team.id}`} className="team-link">
                <span className="team-name">{team.varsity_name}</span>
                <span className="university-name">{team.university}</span>
              </Link>
            </td>
            <td>{team.wins}</td>
            <td>{team.losses}</td>
            <td>{winPct}</td>
            <td>{team.points_for}</td>
            <td>{team.points_against}</td>
            <td className={pointDiff > 0 ? 'positive' : 'negative'}>
              {pointDiff > 0 ? '+' : ''}{pointDiff}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [selectedConference, setSelectedConference] = useState('All');
  const { gender } = useParams();

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/standings/${gender}`);
        setStandings(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchStandings();
  }, [gender]);

  const conferences = ['All', ...new Set(standings.map(team => team.conference))];

  const filteredStandings = selectedConference === 'All'
    ? standings
    : standings.filter(team => team.conference === selectedConference);

  const groupedStandings = filteredStandings.reduce((acc, team) => {
    const conference = team.conference;
    if (!acc[conference]) {
      acc[conference] = {
        divisions: {},
        teams: []
      };
    }
    if (team.division) {
      if (!acc[conference].divisions[team.division]) {
        acc[conference].divisions[team.division] = [];
      }
      acc[conference].divisions[team.division].push(team);
    } else {
      acc[conference].teams.push(team);
    }
    return acc;
  }, {});

  return (
    <div className="standings-container">
      <div className="standings-header">
        <h1>{gender.charAt(0).toUpperCase() + gender.slice(1)}'s Standings</h1>
        <select
          value={selectedConference}
          onChange={(e) => setSelectedConference(e.target.value)}
          className="conference-select"
        >
          {conferences.map(conf => (
            <option key={conf} value={conf}>{conf}</option>
          ))}
        </select>
      </div>

      {Object.entries(groupedStandings).map(([conference, data]) => (
        <div key={conference} className="conference-section">
          <h2>{conference}</h2>
          {Object.keys(data.divisions).length > 0 ? (
            Object.entries(data.divisions).map(([division, teams]) => (
              <div key={division} className="division-section">
                <h3>{division} Division</h3>
                <StandingsTable teams={teams} />
              </div>
            ))
          ) : (
            <StandingsTable teams={data.teams} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Standings;