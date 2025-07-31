import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Scoreboard.css';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import BottomNav from './component/BottomNav';

export default function Scoreboard() {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('📤 Fetching top scores from backend...');
    axios
      .get('http://localhost:2000/api/score/top')
      .then((res) => {
        console.log('✅ Received scores:', res.data);
        setScores(res.data);
      })
      .catch((err) => {
        console.error('❌ Error fetching scores', err);
      });
  }, []);

  return (
    <div className="scoreboard-container">
      <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />

      <div className="back-arrow" onClick={() => navigate('/home')}>
        <MdArrowBack size={28} color="white" />
      </div>

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
