import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import BottomNav from './component/BottomNav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ... (other imports remain the same)
import { FaSignOutAlt } from 'react-icons/fa'; // Optional: icon for logout

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phoneNumber: '', vehicleNumber: '' });
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('https://parkify-web-app-backend.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser({
            name: res.data.name || '',
            email: res.data.email || '',
            phoneNumber: res.data.phoneNumber || '',
            vehicleNumber: res.data.vehicleNumber || '',
          });
        })
        .catch((err) => {
          console.error('Error fetching profile:', err);
        });
    }
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.put(
          'https://parkify-web-app-backend.onrender.com/api/auth/profile',
          user,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Profile saved successfully!');
        setTimeout(() => {
          navigate('/spots');
        }, 1000);
      } catch (err) {
        console.error('Error saving profile:', err.response ? err.response.data : err.message);
        toast.error('Failed to save profile.');
      }
    } else {
      toast.warn('No token found. Please log in.');
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setUser({ ...user, phoneNumber: value });
      setPhoneError('');
    } else {
      setPhoneError('Please enter only numbers for the phone number.');
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="profile-container">
      <div className="auth-form">
        <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
        <h2>My Profile</h2>
        <input
          type="text"
          placeholder="Name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        <input type="email" placeholder="Email" value={user.email} disabled />
        <input
          type="tel"
          placeholder="Phone Number"
          value={user.phoneNumber}
          onChange={handlePhoneNumberChange}
        />
        {phoneError && (
          <p style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{phoneError}</p>
        )}
        <input
          type="text"
          placeholder="Vehicle Number"
          value={user.vehicleNumber}
          onChange={(e) => setUser({ ...user, vehicleNumber: e.target.value })}
        />
        <button onClick={handleSave}>Save</button>

        {/* ✅ Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: '12px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>

      <BottomNav />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />
    </div>
  );
}
