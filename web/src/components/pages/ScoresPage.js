import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/scores.css';

const ScoresPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { gender } = useParams();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/scores/${gender}`);
        const groupedScores = groupScoresByDate(response.data);
        setScores(groupedScores);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gender]);

  const groupScoresByDate = (games) => {
    return games.reduce((acc, game) => {
      const date = new Date(game.date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(game);
      return acc;
    }, {});
  };

  if (loading) return <div>Loading scores...</div>;

  return (
    <div className="scores-page">
      <h1>{gender.charAt(0).toUpperCase() + gender.slice(1)}'s Basketball Scores</h1>
      {Object.entries(scores).map(([date, gamesForDate]) => (
        <div key={date} className="date-section">
          <h2>{date}</h2>
          <div className="scores-grid">
            {gamesForDate.map(game => (
              <div key={game.id} className="score-card">
                <div className="game-header">
                  <span className={`game-type ${game.is_conference_game ? 'conference' : 'non-conference'}`}>
                    {game.is_conference_game ? 'Conference' : 'Non-Conference'}
                  </span>
                </div>
                <div className="team home">
                  <span className="team-name">{game.home_university} {game.home_team}</span>
                  <span className="score">{game.home_team_score}</span>
                </div>
                <div className="team away">
                  <span className="team-name">{game.away_university} {game.away_team}</span>
                  <span className="score">{game.away_team_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScoresPage;