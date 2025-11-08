import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="orbital-system">
          

          <div className="nucleus">
            <div className="proton"></div>
            <div className="proton"></div>
            <div className="neutron"></div>
          </div>
          
          
          <div className="orbital-ring ring-1">
            <div className="electron electron-1"></div>
          </div>
          
          <div className="orbital-ring ring-2">
            <div className="electron electron-2"></div>
            <div className="electron electron-3"></div>
          </div>
          
          <div className="orbital-ring ring-3">
            <div className="electron electron-4"></div>
          </div>
          
          
          <div className="energy-field"></div>
          <div className="glow-effect"></div>
        </div>
        
        <div className="loading-text">
         
          <div className="progress-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}