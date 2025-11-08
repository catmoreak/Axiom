import React from 'react';
import Molecule3D from './Molecule3D';

const Combustion3D = ({ isSimulating }) => {
  return (
    <div className="reaction-card-3d">
      <h2><strong>Combustion Reaction</strong></h2>
      
      <div className="molecule-container">
        <Molecule3D reaction="combustion" isReacting={isSimulating} />
      </div>
      
      <div className="reaction-equation">
        <span className="reactant">CH₄</span> + 
        <span className="reactant">2O₂</span> → 
        <span className="product">CO₂</span> + 
        <span className="product">2H₂O</span> + 
        <span className="energy">Energy</span>
      </div>
      
      <div className="simple-info">
        <p><strong>What happens:</strong> Methane burns with oxygen to create carbon dioxide, water, and energy.</p>
        <p><strong>Real use:</strong> Powers stoves, cars, and heating systems.</p>
      </div>
    </div>
  );
};

export default Combustion3D;