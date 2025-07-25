import React from 'react';
import './MobileContainer.css';

const MobileContainer = ({ children }) => {
  return (
    <div className="mobile-wrapper">
      {children}
    </div>
  );
};

export default MobileContainer;
