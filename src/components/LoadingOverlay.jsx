// src/components/LoadingOverlay.jsx
import React from 'react';
import './loading-overlay.css';

const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="ld-overlay" data-testid="loading-overlay">
      <div className="ld-spinner">
        <div className="ld-dot" />
        <div className="ld-dot" />
        <div className="ld-dot" />
      </div>
    </div>
  );
};

export default LoadingOverlay;
