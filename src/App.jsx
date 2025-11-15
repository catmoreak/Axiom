import React, { useState } from "react";
import AcidBase3D from "./components/AcidBase3D";
import Combustion3D from "./components/Combustion3D";
import Photosynthesis3D from "./components/Photosynthesis3D";
import QuizModal from "./components/QuizModal";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [totalScore, setTotalScore] = useState(0);
  const [selectedAcid, setSelectedAcid] = useState("HCl");
  const [selectedBase, setSelectedBase] = useState("NaOH");
  const [simulationPhase, setSimulationPhase] = useState("");
  const [atomInfo, setAtomInfo] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const handleAtomClick = (symbol) => {
    if (atomInfoData[symbol]) {
      setAtomInfo({ symbol, ...atomInfoData[symbol] });
    }
  };

  const badges = [
    { name: "Beginner Chemist", threshold: 1, icon: "" },
    { name: "Reaction Master", threshold: 3, icon: "" },
    { name: "Chemistry Expert", threshold: 5, icon: "" }
  ];

  const currentBadge = badges.find(badge => totalScore >= badge.threshold) || null;

  const generateQuizQuestions = async () => {
    setIsQuizLoading(true);
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate 5 multiple-choice questions about combustion reactions in chemistry. The questions should be suitable for students, not too difficult, and relevant only to combustion. Each question should have:
- question: the question text
- options: an array of 4 possible answers
- correct: the index (0-3) of the correct answer
- hint: a short hint to help understand

Output only valid JSON array of objects with these fields. No additional text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
     
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
      const questions = JSON.parse(text);
      setQuizQuestions(questions);
      setIsQuizOpen(true);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate quiz questions. Please check your API key and try again.");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizComplete = (score) => {
    setTotalScore(prev => prev + score);
    setIsQuizOpen(false);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setProgress(0);
    setSimulationPhase("Initializing simulation...");
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          setSimulationPhase("Reaction complete!");
          clearInterval(interval);
          setTimeout(() => {
            setIsSimulating(false);
            setSimulationPhase("");
          }, 500);
        }
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 300);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
        <p>Chemistry Simulator</p>
        <div className="header-info">
          
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

          {selectedReaction === "combustion" && (
            <div className="control-group">
              <button
                onClick={generateQuizQuestions}
                className="quiz-button"
                title="After you click on this button, please wait for a few seconds while quiz questions are loading."
                disabled={isQuizLoading}
              >
                {isQuizLoading ? "Loading Quiz Questions..." : "Take Quiz"}
              </button>
            </div>
          )}

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

   
        </aside>

        
        <main className="visualization-area">
          <div className="reaction-info">
            <h2>{reactionNames[selectedReaction]} Reaction</h2>
            
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
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        questions={quizQuestions}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}

