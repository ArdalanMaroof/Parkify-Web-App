import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './component/BottomNav';
import './Wallet.css';

export default function Wallet() {
  const [userScore, setUserScore] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('email');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const POINT_TO_DOLLAR = 0.01;

  const fetchWalletData = async () => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (!email || !token) {
      console.warn('⚠️ Missing email or token in localStorage.');
      return;
    }

    try {
      const res = await axios.get(
        `https://parkify-web-app-backend.onrender.com/api/score/user/${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✅ User API Response:', res.data);
      setUserScore(res.data.totalScore || 0);
      setUserBalance(res.data.totalBalance || 0);
      setUsername(res.data.username || localStorage.getItem('username') || 'User');
      setPaymentDetails(email);
    } catch (err) {
      console.error('❌ Error fetching user data:', err.message);
      if (err.response?.status === 404) {
        setUserScore(0);
        setUserBalance(0);
        setUsername(localStorage.getItem('username') || 'User');
        setPaymentDetails(email);
      }
    }
  };

  useEffect(() => {
    const handleScoreUpdate = () => {
      console.log('🔄 Refreshing wallet data after score update');
      fetchWalletData();
    };

    window.addEventListener('scoreUpdated', handleScoreUpdate);
    return () => window.removeEventListener('scoreUpdated', handleScoreUpdate);
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdraw = async () => {
    const amountFloat = parseFloat(amount);
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    if (!email) {
      alert('⚠️ User email not found. Please log in again.');
      return;
    }

    if (isNaN(amountFloat) || amountFloat <= 0) {
      alert('⚠️ Please enter a valid withdrawal amount.');
      return;
    }

    if (amountFloat < 10) {
      alert('⚠️ Minimum withdrawal amount is $10.');
      return;
    }

    const pointsRequired = amountFloat / POINT_TO_DOLLAR;

    if (userScore < pointsRequired) {
      alert(`❌ You need at least ${pointsRequired.toLocaleString()} points to withdraw $${amountFloat}.`);
      return;
    }

    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw $${amountFloat} (${pointsRequired.toLocaleString()} points)?`
    );

    if (confirmWithdraw) {
      setIsProcessing(true);
      try {
        const res = await axios.post(
          'https://parkify-web-app-backend.onrender.com/api/auth/cashout',
          {
            amount: amountFloat,
            paymentMethod,
            paymentDetails,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('✅ Cash-out response:', res.data);
        setUserScore(res.data.data.newPoints);
        setUserBalance(res.data.data.newBalance);
        setAmount('');
        alert(`✅ $${amountFloat} withdrawal successful!`);
        await fetchWalletData(); // Refresh wallet data
      } catch (err) {
        console.error('❌ Cash-out error:', err.message);
        alert('Failed to process cash-out: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-content">
        <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
        <h2>Wallet</h2>

        {userScore !== null && userBalance !== null ? (
          <div className="wallet-cards">
            <div className="card points-card">
              <h3>Points</h3>
              <p>{userScore} pts</p>
            </div>
            <div className="card balance-card">
              <h3>Balance</h3>
              <p>${userBalance.toFixed(2)}</p>
            </div>
            <p>Debug: Score={userScore}, Balance={userBalance}</p>
          </div>
        ) : (
          <p>Loading your wallet...</p>
        )}

        <div className="cashout-section">
          <h3>Cash Out</h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount ($10 minimum)"
            className="amount-input"
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-method"
          >
            <option value="email">Email</option>
            <option value="phone">Phone Number</option>
          </select>
          <input
            type="text"
            value={paymentDetails}
            onChange={(e) => setPaymentDetails(e.target.value)}
            placeholder={`Enter ${paymentMethod === 'email' ? 'email' : 'phone number'}`}
            className="payment-details"
          />
          <button
            className="cashout-button"
            onClick={handleWithdraw}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Cash Out'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}