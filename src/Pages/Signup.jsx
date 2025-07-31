import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true); // Show loading spinner

    try {
      const res = await axios.post('http://localhost:2000/api/auth/signup', {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed. Try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
      <h2>Sign up now and never circle the block again.</h2>
      {loading && <div className="spinner"></div>} {/* Loading spinner */}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Creating...' : 'Create Account'}
      </button>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
