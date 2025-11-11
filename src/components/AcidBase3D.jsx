import React from 'react';
import Molecule3D from './Molecule3D';

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

const AcidBase3D = ({ isSimulating, selectedAcid, selectedBase, onAtomClick }) => {
  const acid = reactantOptions.acids.find(a => a.name === selectedAcid) || reactantOptions.acids[0];
  const base = reactantOptions.bases.find(b => b.name === selectedBase) || reactantOptions.bases[0];

  
  const producesGas = (acid.type === "strong" && base.type === "weak") || (acid.type === "weak" && base.type === "strong");
  const productType = producesGas ? "gas" : "neutral";
  const salt = `${acid.name.replace('H', base.name.split('O')[0])}`; 

  return (
    <div className="reaction-card-3d">
      <h2><strong>Acid-Base Reaction</strong></h2>
      
      <div className="molecule-container">
        <Molecule3D 
          reaction="acidBase" 
          isReacting={isSimulating} 
          selectedAcid={acid} 
          selectedBase={base} 
          productType={productType}
          onAtomClick={onAtomClick}
        />
      </div>
      
      <div className="reaction-equation">
        <span className="reactant">{acid.formula}</span> + 
        <span className="reactant">{base.formula}</span> → 
        <span className="product">{salt}</span> + 
        <span className="product">H₂O</span>
        {producesGas && <span className="product"> + Gas</span>}
      </div>
      
      <div className="simple-info">
        <p><strong>What happens:</strong> {acid.name} reacts with {base.name} to form {salt} and water.</p>
        <p><strong>Real use:</strong> Neutralizing stomach acid or adjusting pool pH.</p>
      </div>
    </div>
  );
};

export default AcidBase3D;