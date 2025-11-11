import React from 'react';
import Molecule3D from './Molecule3D';

const Photosynthesis3D = ({ isSimulating, onAtomClick }) => {
  return (
    <div className="reaction-card-3d">
      <h2>Photosynthesis</h2>
      
      <div className="molecule-container">
        <Molecule3D reaction="photosynthesis" isReacting={isSimulating} onAtomClick={onAtomClick} />
      </div>
      
      <div className="reaction-equation">
        <span className="reactant">6CO₂</span> + 
        <span className="reactant">6H₂O</span> + 
        <span className="energy">Sunlight</span> → 
        <span className="product">C₆H₁₂O₆</span> + 
        <span className="product">6O₂</span>
      </div>
      
      <div className="simple-info">
        <p><strong>What happens:</strong> Plants use sunlight to make food and oxygen from CO₂ and water.</p>
        <p><strong>Real use:</strong> Produces all oxygen we breathe and food for life on Earth.</p>
      </div>
    </div>
  );
};

export default Photosynthesis3D;


