import React from 'react';
import Molecule3D from './Molecule3D';

const AcidBase3D = ({ isSimulating }) => {
  return (
    <div className="reaction-card-3d">
      <h2><strong>Acid-Base Reaction</strong></h2>
      
      <div className="molecule-container">
        <Molecule3D reaction="acidBase" isReacting={isSimulating} />
      </div>
      
      <div className="reaction-equation">
        <span className="reactant">HCl</span> + 
        <span className="reactant">NaOH</span> → 
        <span className="product">NaCl</span> + 
        <span className="product">H₂O</span>
      </div>
      
      <div className="simple-info">
        <p><strong>What happens:</strong> Acid and base combine to make salt and water.</p>
        <p><strong>Real use:</strong> Antacids in your stomach, pool pH balance.</p>
      </div>
    </div>
  );
};

export default AcidBase3D;