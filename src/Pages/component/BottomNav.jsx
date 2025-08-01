import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './BottomNav.css';
import { MdHome, MdCarRental, MdAccountBalanceWallet, MdPerson } from "react-icons/md";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const isActive = (path) => currentPath === path.toLowerCase;

  /*const navItems = [
    { path: "/home", icon: "🏠", label: "Home" },
    { path: "/status", icon: "🚗", label: "Status" },
    { path: "/wallet", icon: "💳", label: "Wallet" },
    { path: "/profile", icon: "👤", label: "Profile" }
  ];
  */

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
        <div
          className={`nav-icon ${isActive("/home") ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          <MdHome size={50} />
        </div>
        <div
          className={`nav-icon ${isActive("/status") ? "active" : ""}`}
          onClick={() => navigate("/status")}
        >
          <MdCarRental size={50} />
        </div>

        <div className="nav-icon spacer" /> {/* Empty middle spacer for FAB */}

        <div
          className={`nav-icon ${isActive("/Wallet") ? "active" : ""}`}
          onClick={() => navigate("/Wallet")}
        >
          <MdAccountBalanceWallet size={50} />
        </div>
        <div
          className={`nav-icon ${isActive("/profile") ? "active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          <MdPerson size={50} />
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
