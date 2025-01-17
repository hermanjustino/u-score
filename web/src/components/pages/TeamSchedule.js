import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/styles/teamschedule.css';

const TeamSchedule = ({ team }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchSchedule = async () => {
        if (!team?.id) return;
        try {
          const response = await axios.get(`http://localhost:5001/api/teams/${team.id}/schedule`);
          setGames(response.data);
          console.log('Schedule data:', response.data); // Debug log
        } catch (error) {
          setError('Failed to load schedule');
        } finally {
          setLoading(false);
        }
      };
  
      fetchSchedule();
    }, [team?.id]);
  
    if (loading) return <div>Loading schedule...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!games.length) return <div>No games scheduled</div>;
  
    return (
      <div className="team-schedule">
        <h3>{team.varsity_name} Schedule</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Type</th>
              <th>Result</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const isWin = Number(game.team_score) > Number(game.opponent_score);
              console.log('Game:', game); // Debug log
              return (
                <tr key={game.id}>
                  <td>{new Date(game.date).toLocaleDateString()}</td>
                  <td>{game.location} {game.opponent}</td>
                  <td>{game.is_conference_game ? 'Conference' : 'Non-Conference'}</td>
                  <td className={isWin ? 'positive' : 'negative'}>
                    {isWin ? 'W' : 'L'}
                  </td>
                  <td>{game.team_score}-{game.opponent_score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default TeamSchedule;