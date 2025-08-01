import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './component/BottomNav';
import { toast } from 'react-toastify';
//import { ThemeContext } from '../context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';
import './Wallet.css';

export default function Wallet() {
  const [userScore, setUserScore] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('email');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  //const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);
  const navigate = useNavigate();

  const POINT_TO_DOLLAR = 0.01;

  useEffect(() => {
    setUserBalance(userScore * POINT_TO_DOLLAR);
  }, [userScore]);

  const fetchWalletData = async () => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (!email || !token) {
      toast.warn('⚠️ Missing email or token in localStorage.', {
        position: 'top-center',
        autoClose: 2500,
      });
      return;
    }

     try {
      console.log(email, 'email')
      const res = await axios.get(
        `https://parkify-web-app-backend.onrender.com/api/auth/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✅ User API Response:', res.data);
      setUserScore(res.data.score || 0);
      setUsername(res.data.username || localStorage.getItem('username') || 'User');
      //setPaymentDetails(email);
    } catch (err) {
      console.error('❌ Error fetching user data:', err.message);
      if (err.response?.status === 404) {
        setUserScore(0);
        setUserBalance(0);
        setUsername(localStorage.getItem('username') || 'User');
        //setPaymentDetails(email);
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

  // Clear paymentDetails when paymentMethod changes
  useEffect(() => {
    setPaymentDetails('');
  }, [paymentMethod]);

   // Custom confirmation toast
  const confirmToast = (message) =>
    new Promise((resolve) => {
      const ConfirmToast = () => (
        <div>
          <p>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
            >
              Confirm
            </button>
            <button
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      );

      toast(<ConfirmToast />, {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      });
    });


  const handleWithdraw = async () => {
    const amountFloat = parseFloat(amount);
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    if (!email) {
      toast.warn('⚠️ User email not found. Please log in again.', {
        position: 'top-center',
        autoClose: 2500,
      });
      return;
    }

    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.warn('⚠️ Please enter a valid withdrawal amount.', {
        position: 'top-center',
        autoClose: 2500,
      });
      return;
    }

    if (!paymentDetails) {
      toast.warn(`⚠️ Please enter a valid ${paymentMethod === 'email' ? 'email' : 'phone number'}.`, {
        position: 'top-center',
        autoClose: 2500,
      });
      return;
    }


    const pointsRequired = amountFloat / POINT_TO_DOLLAR;

    if (userScore < pointsRequired) {
      toast.error(`❌ You need at least ${pointsRequired.toLocaleString()} points to withdraw $${amountFloat}.`, {
        position: 'top-center',
        autoClose: 2500,
      });
      return;
    }

    const confirmWithdraw = await confirmToast(
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

        const userProfile = await axios.get(`https://parkify-web-app-backend.onrender.com/api/auth/profile`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        });

        const existingScore = userProfile.data.score;
        const remainingScore = existingScore - (amountFloat / POINT_TO_DOLLAR);
        // // UPDATE POINTS IS USER PROFILE
        await axios.put(`https://parkify-web-app-backend.onrender.com/api/auth/profile`, {
          score: remainingScore
        }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Cash-out response:', res.data);
        setUserScore(res.data.data.newPoints || 0);
        setUserBalance(res.data.data.newBalance || 0);
        setAmount('');
        setPaymentDetails('');
        toast.success(`✅ $${amountFloat} withdrawal successful!`, {
          position: 'top-center',
          autoClose: 2500,
        });
        await fetchWalletData(); // Refresh wallet data
      } catch (err) {
        console.error('❌ Cash-out error:', err.message);
        toast.error('Failed to process cash-out: ' + (err.response?.data?.message || err.message), {
          position: 'top-center',
          autoClose: 2500,
        });
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
            placeholder="Enter amount"
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
            type={paymentMethod === 'email' ? 'email' : 'tel'}
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
