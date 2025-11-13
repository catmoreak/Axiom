import React, { useState } from "react";
import AcidBase3D from "./components/AcidBase3D";
import Combustion3D from "./components/Combustion3D";
import Photosynthesis3D from "./components/Photosynthesis3D";
import QuizModal from "./components/QuizModal";

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

const quizQuestions = {
  combustion: [
    { question: "What is the main product of combustion?", options: ["Water", "Carbon Dioxide", "Oxygen", "Hydrogen"], correct: 1, hint: "Combustion of hydrocarbons produces CO2 and H2O." },
    { question: "Why does combustion require oxygen?", options: ["To cool the reaction", "To provide fuel", "To oxidize the fuel", "To create heat"], correct: 2, hint: "Oxygen acts as the oxidizing agent in the reaction." }
  ],
  acidBase: [
    { question: "What is produced in an acid-base reaction?", options: ["Gas", "Salt and Water", "Acid", "Base"], correct: 1, hint: "Neutralization reactions produce salt and water." },
    { question: "What does HCl represent?", options: ["Base", "Salt", "Acid", "Water"], correct: 2, hint: "HCl is hydrochloric acid, a strong acid." }
  ],
  photosynthesis: [
    { question: "What gas is produced in photosynthesis?", options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correct: 1, hint: "Plants release oxygen as a byproduct." },
    { question: "What does the plant use as energy?", options: ["Water", "Sunlight", "Soil", "Air"], correct: 1, hint: "Light energy is converted to chemical energy." }
  ]
};

const reactantOptions = {
  acids: [
    { name: "HCl", formula: "HCl", color: "#e17055", type: "strong" },
    { name: "H2SO4", formula: "H₂SO₄", color: "#fd79a8", type: "strong" },
    { name: "CH3COOH", formula: "CH₃COOH", color: "#a29bfe", type: "weak" }
  ],
  bases: [
    { name: "NaOH", formula: "NaOH", color: "#00b894", type: "strong" },
    { name: "KOH", formula: "KOH", color: "#00cec9", type: "strong" },
    { name: "NH3", formula: "NH₃", color: "#fdcb6e", type: "weak" }
  ]
};

const atomInfoData = {
  H: { name: 'Hydrogen', atomicNumber: 1, valence: 1, role: "Hydrogen is the lightest element and often forms H+ ions in acids.", example: "Used in fuel cells and water (H₂O)." },
  O: { name: 'Oxygen', atomicNumber: 8, valence: 2, role: "Oxygen accepts electrons and forms bonds in water and oxides.", example: "Essential for respiration and combustion." },
  Cl: { name: 'Chlorine', atomicNumber: 17, valence: 1, role: "Chlorine forms Cl- ions and is highly reactive.", example: "Used in table salt (NaCl) and disinfectants." },
  Na: { name: 'Sodium', atomicNumber: 11, valence: 1, role: "Sodium forms Na+ ions and is a strong base component.", example: "Found in baking soda and soaps." },
  C: { name: 'Carbon', atomicNumber: 6, valence: 4, role: "Carbon forms the backbone of organic molecules.", example: "Basis of life in sugars and fuels." },
  S: { name: 'Sulfur', atomicNumber: 16, valence: 2, role: "Sulfur forms strong acids like sulfuric acid.", example: "Used in batteries and fertilizers." },
  N: { name: 'Nitrogen', atomicNumber: 7, valence: 3, role: "Nitrogen forms ammonia and nitrates.", example: "Key in fertilizers and air." },
  K: { name: 'Potassium', atomicNumber: 19, valence: 1, role: "Potassium forms K+ ions, similar to sodium.", example: "Important for plant growth and batteries." }
};

const guidedSteps = {
  combustion: [
    { title: "Observe Reactants", description: "Look at the fuel (CH4) and oxygen (O2) molecules. Notice their structure.", action: "Observe" },
    { title: "Initiate Reaction", description: "Click to start the combustion process. Watch as the molecules react!", action: "Start Reaction" },
    { title: "Watch the Reaction", description: "See the energy release and product formation. Combustion is exothermic!", action: "Continue" },
    { title: "Identify Products", description: "Carbon dioxide and water are produced. This is why we need oxygen for burning.", action: "Complete" }
  ],
  acidBase: [
    { title: "Examine Acid and Base", description: "HCl (acid) and NaOH (base) are ready to react. Acids donate H+, bases accept H+.", action: "Observe" },
    { title: "Mix the Solutions", description: "Combine the acid and base. Watch for the neutralization reaction!", action: "Mix" },
    { title: "Observe Neutralization", description: "The H+ from acid combines with OH- from base to form water.", action: "Continue" },
    { title: "Check Products", description: "Salt (NaCl) and water are formed. This is neutralization!", action: "Complete" }
  ],
  photosynthesis: [
    { title: "Setup Plant Cell", description: "CO2 and H2O are present with sunlight. Chlorophyll captures light energy.", action: "Observe" },
    { title: "Absorb Sunlight", description: "Light energy is converted to chemical energy in the chloroplasts.", action: "Start Photosynthesis" },
    { title: "Chemical Reaction", description: "Carbon dioxide and water combine to form glucose and oxygen.", action: "Continue" },
    { title: "Release Oxygen", description: "O2 is released as a byproduct. Plants are our oxygen factories!", action: "Complete" }
  ]
};

import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const [selectedReaction, setSelectedReaction] = useState("combustion");
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedAcid, setSelectedAcid] = useState("HCl");
  const [selectedBase, setSelectedBase] = useState("NaOH");
  const [simulationPhase, setSimulationPhase] = useState("");
  const [atomInfo, setAtomInfo] = useState(null);

  const handleAtomClick = (symbol) => {
    if (atomInfoData[symbol]) {
      setAtomInfo({ symbol, ...atomInfoData[symbol] });
    }
  };

  const badges = [
    { name: "Beginner Chemist", threshold: 1, icon: "🧪" },
    { name: "Reaction Master", threshold: 3, icon: "⚗️" },
    { name: "Chemistry Expert", threshold: 5, icon: "🏆" }
  ];

  const currentBadge = badges.find(badge => totalScore >= badge.threshold) || null;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setProgress(0);
    setSimulationPhase("Preparing reactants...");
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 25 && newProgress < 50) setSimulationPhase("Mixing reactants...");
        else if (newProgress >= 50 && newProgress < 75) setSimulationPhase("Reaction in progress...");
        else if (newProgress >= 75 && newProgress < 100) setSimulationPhase("Forming products...");
        else if (newProgress >= 100) {
          setSimulationPhase("Reaction complete!");
          clearInterval(interval);
          setTimeout(() => {
            setIsSimulating(false);
            setSimulationPhase("");
            setShowQuizPrompt(true);
          }, 500);
        }
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 300);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleQuizComplete = (score) => {
    console.log('Quiz completed with score:', score);
    setTotalScore(totalScore + score);
    
  };

  const SelectedComponent = reactionComponents[selectedReaction];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Universe Background Elements */}
      <div className="meteors">
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
        <div className="meteor"></div>
      </div>
      
      <header className="header">
        <h1>Axiom</h1>
        <p>Advanced 3D Chemistry Simulator</p>
        <div className="header-info">
          <div className="score-display">Score: {totalScore}</div>
          {currentBadge && (
            <div className="badge-display">
              {currentBadge.icon} {currentBadge.name}
            </div>
          )}
        </div>
        <div className="theme-toggle-container">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle-button"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '🌑' : '🌞'}
          </button>
        </div>
      </header>

      
      <div className="main-grid">
        
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

          {selectedReaction === "acidBase" && (
            <>
              <div className="control-group">
                <label className="control-label">Select Acid</label>
                <select
                  value={selectedAcid}
                  onChange={(e) => setSelectedAcid(e.target.value)}
                  className="reactant-selector"
                >
                  {reactantOptions.acids.map(acid => (
                    <option key={acid.name} value={acid.name}>{acid.formula} ({acid.name})</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Select Base</label>
                <select
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                  className="reactant-selector"
                >
                  {reactantOptions.bases.map(base => (
                    <option key={base.name} value={base.name}>{base.formula} ({base.name})</option>
                  ))}
                </select>
              </div>
            </>
          )}

          
          <div className="control-group legend">
            <h4>Legend</h4>
            <div className="legend-row"><span className="legend-swatch" style={{background:'#e17055'}}></span> Oxygen / acid</div>
            <div className="legend-row"><span className="legend-swatch" style={{background:'#00b894'}}></span> Base / Alkali</div>
            <div className="legend-row"><span className="legend-swatch" style={{background:'#ffffff', border:'1px solid #ccc'}}></span> Hydrogen / H</div>
            <div className="legend-row"><span className="legend-swatch" style={{background:'#ffeaa7'}}></span> Salt (product)</div>
            <div className="legend-note">Tip: Hover atoms to highlight and view labels; click atoms for detailed info; charged ions glow red (positive) or green (negative).</div>
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
              <div className="phase-text">{simulationPhase}</div>
            </div>
          )}

          <div className="instructions-panel">
            <h4>Controls</h4>
            <ul>
              <li><strong>Rotate:</strong> Left click + drag</li>
              <li><strong>Zoom:</strong> Mouse wheel</li>
              <li><strong>Pan:</strong> Right click + drag</li>
            </ul>
            <p>After simulation, test your knowledge with a quiz!</p>
          </div>
        </aside>

        
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
            <SelectedComponent 
              isSimulating={isSimulating} 
              selectedAcid={selectedAcid} 
              selectedBase={selectedBase} 
              onAtomClick={handleAtomClick}
            />
          </div>
        </main>
      </div>
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        questions={quizQuestions[selectedReaction]}
        onComplete={handleQuizComplete}
      />
      {showQuizPrompt && (
        <div className="quiz-prompt-overlay">
          <div className="quiz-prompt">
            <h3>Simulation Complete!</h3>
            <p>Want to test your knowledge with a quick quiz?</p>
            <div className="prompt-buttons">
              <button onClick={() => { setShowQuiz(true); setShowQuizPrompt(false); }}>Yes, take quiz</button>
              <button onClick={() => setShowQuizPrompt(false)}>No, thanks</button>
            </div>
          </div>
        </div>
      )}
      {atomInfo && (
        <div className="atom-info-overlay">
          <div className="atom-info-modal">
            <button className="close-button" onClick={() => setAtomInfo(null)}>×</button>
            <h3>{atomInfo.symbol} - {atomInfo.name}</h3>
            <p><strong>Atomic Number:</strong> {atomInfo.atomicNumber}</p>
            <p><strong>Valence:</strong> {atomInfo.valence}</p>
            <p><strong>Role in Reaction:</strong> {atomInfo.role}</p>
            <p><strong>Real-World Example:</strong> {atomInfo.example}</p>
          </div>
        </div>
      )}
    </div>
  );
}

