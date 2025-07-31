import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added for loading spinner
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true); // Show loading spinner

    try {
      const res = await axios.post('http://localhost:2000/api/auth/login', {
        email: email.toLowerCase(),
        password,
      });

      console.log('Login response:', res.data); // Debug log
      // Store the token in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.data.id);
      localStorage.setItem('email', res.data.data.email);
      localStorage.setItem('username', res.data.data.name);

      console.log(res.data.data.email, res.data.data.name);
      alert('Login successful!');
      navigate('/home'); // Always navigate to /home (StartParking.jsx)
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
      <h2>Welcome back, park without stress.</h2>
      {loading && <div className="spinner"></div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}
