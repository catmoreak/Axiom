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
      {/* Header Section */}
      <header className="header">
        <h1>Axiom</h1>
        <p>Advanced 3D Chemistry Simulator</p>
      </header>

      {/* Main Application Grid */}
      <div className="main-grid">
        {/* Control Panel */}
        <aside className="control-panel">
          <div className="panel-header">
            <h3>Reaction Controls</h3>
          </div>

          <div className="control-group">
            <label className="control-label">Select Reaction Type</label>
            <select
              value={selectedReaction}
              onChange={(e) => setSelectedReaction(e.target.value)}
              className="reaction-selector"
            >
              {Object.keys(reactionComponents).map(key => (
                <option key={key} value={key}>{reactionNames[key]}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="simulate-button"
            >
              {isSimulating ? "Running..." : "Start Simulation"}
            </button>
          </div>

          {isSimulating && (
            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="instructions-panel">
            <h4>Controls</h4>
            <ul>
              <li><strong>Rotate:</strong> Left click + drag</li>
              <li><strong>Zoom:</strong> Mouse wheel</li>
              <li><strong>Pan:</strong> Right click + drag</li>
            </ul>
          </div>
        </aside>

        {/* 3D Visualization Area */}
        <main className="visualization-area">
          <div className="reaction-info">
            <h2>{reactionNames[selectedReaction]} Reaction</h2>
            <div className="reaction-status">
              {isSimulating ? (
                <span className="status-active">Simulation Active</span>
              ) : (
                <span className="status-idle">Ready to Simulate</span>
              )}
            </div>
          </div>

          <div className="canvas-container">
            <SelectedComponent isSimulating={isSimulating} />
          </div>
        </main>
      </div>
    </div>
  );
}




