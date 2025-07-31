import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './Pages/Home';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import StartParking from './Pages/StartParking';
import ParkingSpots from './Pages/ParkingSpots';
import Profile from './Pages/Profile';
import Status from './Pages/Status';
import Scoreboard from './Pages/Scoreboard';
import Wallet from './Pages/Wallet';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains('dark'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.body.classList.contains('dark'));

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeProvider> {/* Wrap everything with ThemeProvider */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<StartParking />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/spots" element={<ParkingSpots />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/status" element={<Status />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          pauseOnFocusLoss
          theme={isDarkMode ? 'dark' : 'light'}
          closeButton={false}
          toastStyle={{
            backgroundColor: isDarkMode ? '#1e1e2f' : '#ffffff',
            color: isDarkMode ? '#fff' : '#000',
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            padding: '12px 16px',
            width: '100%',
            maxWidth: '320px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'none',
          }}
          bodyStyle={{
            margin: 0,
            padding: 0,
            flex: 1,
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;