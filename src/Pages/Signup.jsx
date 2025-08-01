import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      toast.error('⚠️ Please fill in all fields to continue.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast.warn('📧 Please enter a valid email address.');
      return;
    }
    if (trimmedPassword.length < 6) {
      toast.warn('🔒 Password must be at least 6 characters long.');
      return;
    }

    setLoading(true); // Show loading spinner

    try {
      const res = await axios.post('https://parkify-web-app-backend.onrender.com/api/auth/signup', {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      // Improved success message
      toast.success(`🎉 Account created successfully! Welcome to Parkify, ${trimmedName.split(' ')[0]}! Please login with your credentials.`, {
        autoClose: 4000, // Give user more time to read
      });
      
      // Small delay before redirecting to let user read the message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in-up">
      <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
      <h2>🚀 Sign up now and never circle the block again.</h2>
      {loading && <div className="spinner" aria-live="polite"></div>}
      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <input
          className="auth-input"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          className="auth-input"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button className="auth-button" onClick={handleSignup} disabled={loading}>
          {loading ? '⏳ Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
