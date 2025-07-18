// src/Pages/Wallet.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import BottomNav from './component/BottomNav';
import './Wallet.css';

export default function Wallet() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [bankAccount, setBankAccount] = useState('');
  const navigate = useNavigate();

  // Points to dollars conversion rate (100 points = $1)
  const pointsToDollarRate = 100;

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        
        if (!token || !email) {
          navigate('/login');
          return;
        }

        // Get all scores for the logged-in user
        const response = await axios.get(
          'https://parkify-web-app-backend.onrender.com/api/score/top' // Using same endpoint as scoreboard
        );
        
        // Find current user in the scores
        const userScores = response.data.filter(score => score._id === email);
        const userTotal = userScores.reduce((sum, score) => sum + score.score, 0);
        
        setTotalPoints(userTotal);
      } catch (error) {
        console.error('Error fetching user points:', error);
      }
    };

    fetchUserPoints();
  }, [navigate]);

  const handleCashOut = async () => {
    const pointsRequired = cashOutAmount * pointsToDollarRate;
    
    if (pointsRequired > totalPoints) {
      alert('You don\'t have enough points for this cash out');
      return;
    }

    if (!bankAccount) {
      alert('Please enter your bank account details');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      // In a real app, this would connect to a payment processor
      // For simulation, we'll just deduct points
      await axios.post(
        'https://parkify-web-app-backend.onrender.com/api/auth/cashout',
        {
          amount: cashOutAmount,
          paymentMethod: 'bank',
          paymentDetails: bankAccount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(`Success! $${cashOutAmount} will be transferred to your bank account.`);
      setTotalPoints(prev => prev - pointsRequired);
      setCashOutAmount(0);
    } catch (error) {
      console.error('Cash out failed:', error);
      alert('Cash out failed. Please try again.');
    }
  };

  return (
    <div className="wallet-container">
      <div className="back-arrow" onClick={() => navigate('/home')}>
        <MdArrowBack size={28} color="white" />
      </div>

      <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
      <h2>Your Wallet</h2>

      <div className="wallet-balance">
        <h3>Total Points</h3>
        <p className="points">{totalPoints} pts</p>
        <p className="value">≈ ${(totalPoints / pointsToDollarRate).toFixed(2)}</p>
      </div>

      <div className="cash-out-section">
        <h3>Cash Out Points</h3>
        
        <div className="input-group">
          <label>Amount ($):</label>
          <input
            type="number"
            min="1"
            value={cashOutAmount}
            onChange={(e) => setCashOutAmount(parseFloat(e.target.value) || 0)}
          />
          <small>Minimum $1 (100 points)</small>
        </div>

        <div className="input-group">
          <label>Bank Account:</label>
          <input
            type="text"
            placeholder="Enter account number"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />
        </div>

        <button 
          onClick={handleCashOut}
          disabled={!cashOutAmount || !bankAccount}
          className="cash-out-btn"
        >
          Cash Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}