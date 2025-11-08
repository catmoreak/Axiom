import React, { useState } from "react";
import AcidBase3D from "./components/AcidBase3D";
import Combustion3D from "./components/Combustion3D";
import Photosynthesis3D from "./components/Photosynthesis3D";

const reactionComponents = {
  combustion: Combustion3D,
  acidBase: AcidBase3D,
  photosynthesis: Photosynthesis3D
};

const reactionNames = {
  combustion: "Combustion",
  acidBase: "Acid-Base", 
  photosynthesis: "Photosynthesis"
};

import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const [selectedReaction, setSelectedReaction] = useState("combustion");
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);


  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSimulating(false), 500);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const SelectedComponent = reactionComponents[selectedReaction];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Chemical Reactions Lab</h1>
        <p>Interactive 3D Chemistry Simulator</p>
      </header>
      
      <div className="controls">
        <div className="selector">
          <label htmlFor="reaction-select">Select a Reaction:</label>
          <select
            id="reaction-select"
            value={selectedReaction}
            onChange={(e) => setSelectedReaction(e.target.value)}
            className="select-dropdown"
          >
            {Object.keys(reactionComponents).map(key => (
              <option key={key} value={key}>{reactionNames[key]}</option>
            ))}
          </select>
        </div>
        

      </div>
      
      <div className="controls-help">
        Drag to rotate • Scroll to zoom • Click simulate to start
      </div>
      
      <SelectedComponent isSimulating={isSimulating} />
      
      <div className="simulation-section">
        <button 
          onClick={handleSimulate} 
          disabled={isSimulating}
          className="simulate-btn"
        >
          {isSimulating ? "Simulating..." : "Start Reaction"}
        </button>
        
        {isSimulating && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <p>Reaction Progress: {progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}




