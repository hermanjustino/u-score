import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GameList from './GameList';
import '../../assets/styles/schedule.css';

const SchedulePage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { gender } = useParams();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/games/${gender}`);
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [gender]);

  if (loading) return <div>Loading...</div>;

  const upcomingGames = games.filter(game => game.status === 'scheduled');
  const completedGames = games.filter(game => game.status === 'final');

  return (
    <div className="schedule-page">
      <h1>{gender.charAt(0).toUpperCase() + gender.slice(1)}'s Basketball Schedule</h1>
      <h2>Upcoming Games</h2>
      <GameList games={upcomingGames} />
      <h2>Completed Games</h2>
      <GameList games={completedGames} />
    </div>
  );
};

export default SchedulePage;