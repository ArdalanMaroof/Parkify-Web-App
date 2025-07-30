import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const isActive = (path) => currentPath === path;

  const navItems = [
    { path: "/home", icon: "🏠", label: "Home" },
    { path: "/status", icon: "🚗", label: "Status" },
    { path: "/wallet", icon: "💳", label: "Wallet" },
    { path: "/profile", icon: "👤", label: "Profile" }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="nav-wrapper">
      {/* Floating Trophy Button */}
      <div className="fab-container" onClick={() => handleNavClick("/scoreboard")}>
        <div className="fab-glow" />
        <div className="fab-btn">
          <span className="fab-icon">🏆</span>
        </div>
        <div className="fab-ripple" />
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-backdrop" />
        {navItems.map((item, index) => (
          <React.Fragment key={item.path}>
            {index === 2 && <div className="nav-spacer" />} {/* For FAB spacing */}
            <div
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => handleNavClick(item.path)}
            >
              <div className="nav-icon-wrapper">
                <span className="nav-icon">{item.icon}</span>
                {isActive(item.path) && <div className="nav-indicator" />}
              </div>
              <span className="nav-label">{item.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
