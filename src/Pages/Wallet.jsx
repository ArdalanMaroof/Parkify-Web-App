import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './component/BottomNav';
import './Wallet.css';

export default function Wallet() {
  const [userScore, setUserScore] = useState(null);
  const [username, setUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const POINT_TO_DOLLAR = 0.001;

  useEffect(() => {
    const email = localStorage.getItem('email');
    console.log('🧠 Retrieved email from localStorage:', email);

    if (!email) {
      console.warn('⚠️ No email found in localStorage. Cannot fetch score.');
      setError('No email found. Please log in again.');
      setLoading(false);
      return;
    }

    const url = `http://localhost:5000/api/score/user/${email}`;
    console.log('📤 Sending request to:', url);

    setLoading(true);
    setError(null);

    axios
      .get(url)
      .then((res) => {
        console.log('✅ Score API Response:', res.data);
        
        // Handle different possible response structures
        if (res.data && typeof res.data === 'object') {
          setUserScore(res.data.score || 0);
          setUsername(res.data.username || res.data.name || 'User');
        } else {
          // If response is just a number or unexpected format
          setUserScore(0);
          setUsername('User');
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching user score:', err.message);
        if (err.response) {
          console.error('🔎 Full error response:', err.response);
          setError(`Error: ${err.response.status} - ${err.response.data?.message || 'Failed to fetch score'}`);
        } else {
          setError('Network error. Please check your connection.');
        }
        
        // Set defaults on error so user can still see the interface
        setUserScore(0);
        setUsername('User');
        setLoading(false);
      });
  }, []);

  const handleWithdraw = () => {
    if (userScore < 5000) {
      alert('⚠️ You need at least 5,000 points to withdraw $5.');
      return;
    }

    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw $5 (5,000 points)?`
    );

    if (confirmWithdraw) {
      setIsProcessing(true);
      // Simulate a delay
      setTimeout(() => {
        setUserScore((prev) => prev - 5000);
        setIsProcessing(false);
        alert('✅ $5 withdrawal successful! (Simulated)');
        // Later: POST to /api/withdraws
      }, 2000);
    }
  };

  const moneyValue = ((userScore || 0) * POINT_TO_DOLLAR).toFixed(2);

  return (
    <>
      {/* Use the same container class as auth pages for consistent width */}
      <div className="wallet-container fade-in-up">
        <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
        <h2>💰 Wallet</h2>

        {loading ? (
          <div className="content-section">
            <div className="spinner"></div>
            <p>Loading your points...</p>
          </div>
        ) : error ? (
          <div className="content-section">
            <div className="card">
              <p style={{color: '#dc3545', textAlign: 'center'}}>⚠️ {error}</p>
              <button 
                className="auth-button" 
                onClick={() => window.location.reload()}
                style={{marginTop: '10px'}}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="content-section">
            <div className="card">
              <h3>{username}'s Points</h3>
              <p><strong>{userScore || 0} pts</strong></p>
            </div>
            
            <div className="card">
              <h3>Cash Value</h3>
              <p><strong>${moneyValue}</strong></p>
            </div>

            <div className="wallet-buttons">
              <button
                className="auth-button"
                onClick={handleWithdraw}
                disabled={isProcessing || (userScore || 0) < 5000}
              >
                {isProcessing ? '⏳ Processing...' : '💸 Withdraw $5'}
              </button>
            </div>
            
            {(userScore || 0) < 5000 && (
              <p className="text-center" style={{color: '#6b7280', fontSize: '0.9rem', marginTop: '10px'}}>
                You need 5,000 points to withdraw
              </p>
            )}
          </div>
        )}
      </div>
      
      <BottomNav />
    </>
  );
}