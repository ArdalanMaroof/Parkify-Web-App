import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import BottomNav from './component/BottomNav';

export default function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopScores = async () => {
    setLoading(true);
      setError(null);
      try {
    console.log('📤 Fetching top scores from backend...');
    const res = await axios.get('http://localhost:5000/api/score/top');
    console.log('✅ Received scores:', res.data);
        setScores(res.data);
      } catch(err) {
        
        console.error('❌ Error fetching scores:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopScores();
  }, []);

  return (
    <div className="scoreboard-container ">
      <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />

      <h2>🏆 Top Parkify Users</h2>

      <ul className="score-list">
        {scores.map((user, index) => (
          <li key={user._id} className={`score-item ${index < 3 ? 'top-three' : ''}`}>
            <span className="rank">{index + 1}.</span>
            <span className="name">{user.username}</span>
            <span className="points">{user.score} pts</span>
            {index < 3 && <span className="badge">{['🥇', '🥈', '🥉'][index]}</span>}
          </li>
        ))}
      </ul>

        <BottomNav />
    </div>
    
  );
}
