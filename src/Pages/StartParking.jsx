// src/Pages/StartParking.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../StartParking.css';
import BottomNav from './component/BottomNav';
import { ThemeContext } from '../context/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StartParking = () => {
  const [location, setLocation] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  const cities = [
    'Vancouver',
    'Surrey',
    'New Westminster',
    'Richmond',
    'Burnaby',
    'Langley',
    'North Vancouver',
    'West Vancouver',
    'Coquitlam',
    'Port Coquitlam',
  ];

  const filteredCities = cities.filter(
    (city) =>
      city.toLowerCase().includes(location.toLowerCase()) &&
      city.toLowerCase() !== location.toLowerCase()
  );

  const handleStart = () => {
    if (!location.trim()) {
      toast.warn('Please enter your location!', {
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    const selectedType = 'All';
    navigate(`/spots?location=${encodeURIComponent(location)}&type=${selectedType}`);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setIsInputFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (city) => {
    setLocation(city);
    setShowSuggestions(false);
    setIsInputFocused(false);
  };

  const handleCityChipClick = (city) => {
    setLocation(city);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="start-container">
      <div className="top-bar">
        <img src="/Parkify-logo.jpg" alt="Parkify Logo" className="logo" />
        <label className="theme-switch">
          <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
          <span className="slider"></span>
        </label>
      </div>

      <div className="main-content">
        <div className="hero-section">
          <h1 className="main-title">Find Your Perfect Spot</h1>
          <p className="subtitle">
            No more circling the block – your perfect parking spot is just a tap away.
          </p>
        </div>

        <div className="search-section">
          <div className={`location-input-container ${isInputFocused ? 'focused' : ''}`}>
            <input
              type="text"
              placeholder="Enter your city or location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              className="search-input"
            />

            <button onClick={handleStart} className="search-btn">
              Search
            </button>
          </div>
          <div className="car-animation">
            <div className="car">🚗</div>
            <div className="road"></div>
          </div>
          {location && showSuggestions && filteredCities.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredCities.slice(0, 6).map((city, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(city)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="popular-section">
          <h3>Popular Locations</h3>
          <div className="popular-cities">
            {cities.slice(0, 6).map((city, index) => (
              <button key={index} className="city-chip" onClick={() => handleCityChipClick(city)}>
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
};

export default StartParking;
