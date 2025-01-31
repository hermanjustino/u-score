import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/standings.css';

const StandingsTable = ({ teams, sortConfig, onSort }) => {
  const getClassNamesFor = (name) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <table className="standings-table">
      <thead>
        <tr>
          <th className="team-column">
            Team
          </th>
          <th onClick={() => onSort('wins')}>
            W {getClassNamesFor('wins') && (
              <span className={`sort-${getClassNamesFor('wins')}`} />
            )}
          </th>
          <th onClick={() => onSort('losses')}>
            L {getClassNamesFor('losses') && (
              <span className={`sort-${getClassNamesFor('losses')}`} />
            )}
          </th>
          <th onClick={() => onSort('winPct')}>
            PCT {getClassNamesFor('winPct') && (
              <span className={`sort-${getClassNamesFor('winPct')}`} />
            )}
          </th>
          <th onClick={() => onSort('points_for')}>
            PF {getClassNamesFor('points_for') && (
              <span className={`sort-${getClassNamesFor('points_for')}`} />
            )}
          </th>
          <th onClick={() => onSort('points_against')}>
            PA {getClassNamesFor('points_against') && (
              <span className={`sort-${getClassNamesFor('points_against')}`} />
            )}
          </th>
          <th onClick={() => onSort('pointDiff')}>
            DIFF {getClassNamesFor('pointDiff') && (
              <span className={`sort-${getClassNamesFor('pointDiff')}`} />
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => {
          const winPct = team.games_played ? ((team.wins / team.games_played) * 100).toFixed(1) : '0.0';
          const pointDiff = team.points_for - team.points_against;
          team.winPct = parseFloat(winPct);
          team.pointDiff = pointDiff;

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
};

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [selectedConference, setSelectedConference] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'conference_wins', direction: 'desc' });
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

  const onSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortTeams = (teams) => {
    return [...teams].sort((a, b) => {
      if (sortConfig.direction === 'desc') {
        return b[sortConfig.key] - a[sortConfig.key];
      }
      return a[sortConfig.key] - b[sortConfig.key];
    });
  };

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
                <StandingsTable
                  teams={sortTeams(teams)}
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </div>
            ))
          ) : (
            <StandingsTable
              teams={sortTeams(data.teams)}
              sortConfig={sortConfig}
              onSort={onSort}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Standings;