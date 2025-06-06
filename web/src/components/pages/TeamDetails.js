import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/teamdetails.css';
import TeamSchedule from './TeamSchedule';

const TeamInfo = ({ team }) => (
  <div className="team-info">
    <div className="info-row">
      <span className="info-label">Location:</span>
      <span className="info-value">{team.city || 'N/A'}{team.province ? `, ${team.province}` : ''}</span>
    </div>
    <div className="info-row">
      <span className="info-label">Founded:</span>
      <span className="info-value">{team.founded || 'N/A'}</span>
    </div>
    <div className="info-row">
      <span className="info-label">Arena:</span>
      <span className="info-value">{team.arena || 'N/A'}</span>
    </div>
    <div className="info-row">
      <span className="info-label">Capacity:</span>
      <span className="info-value">{team.capacity || 'N/A'}</span>
    </div>
    <div className="info-row">
      <span className="info-label">Conference:</span>
      <span className="info-value">{team.conference || 'N/A'}</span>
    </div>
    {team.division && (
      <div className="info-row">
        <span className="info-label">Division:</span>
        <span className="info-value">{team.division}</span>
      </div>
    )}
  </div>
);

const TeamStats = () => (
  <div className="team-stats">
    <h3>Team Statistics</h3>
    <p>Stats coming soon...</p>
  </div>
);

const TeamRoster = ({ team }) => {
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        // Fetch players for the team from your API endpoint
        const response = await axios.get(`http://localhost:5001/api/players?teamId=${team.id}`);
        setRoster(response.data);
      } catch (error) {
        console.error('Error fetching roster:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [team.id]);

  if (loading) return <div>Loading roster...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!roster) return <div>No roster data available.</div>;

  return (
    <div className="team-roster" style={{ textAlign: 'center' }}> {/* Centering the content */}
      <h3>Team Roster</h3>
      {roster.length > 0 ? (
        <table className="roster-table" style={{ margin: '0 auto' }}> {/* Centering the table */}
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {roster.map(player => (
              <tr key={player.id}>
                <td>{player.jersey_number || 'N/A'}</td>
                <td>{player.first_name} {player.last_name}</td>
                <td>{player.position || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No players in the roster.</p>
      )}
    </div>
  );
};

const TeamHome = () => (
  <div className="team-home">
    <h3>Team Home</h3>
    <p>Team overview coming soon...</p>
  </div>
);

const TeamDetails = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const { id } = useParams();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/teams/${id}`);
        setTeam(response.data);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!team) return <div>Team not found</div>;

  const tabs = [
    { id: 'home', label: 'Home', component: TeamHome },
    { id: 'schedule', label: 'Schedule', component: TeamSchedule },
    { id: 'stats', label: 'Stats', component: TeamStats },
    { id: 'roster', label: 'Roster', component: TeamRoster },
    { id: 'info', label: 'Info', component: TeamInfo }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab).component;

  return (
    <div className="team-details">
      <div className="team-header">
        <h1>{team.university}</h1>
        <h2>{team.varsity_name}</h2>
      </div>
      
      <div className="team-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <ActiveComponent team={team} />
      </div>
      
      <Link to={`/teams/${team.gender}`} className="back-button">
        Back to Teams
      </Link>
    </div>
  );
};

export default TeamDetails;