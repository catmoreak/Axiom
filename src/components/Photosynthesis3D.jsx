import React from 'react';
import Molecule3D from './Molecule3D';

const Photosynthesis3D = ({ isSimulating, onAtomClick }) => {
  return (
   <div className="reaction-card-3d">
      <h2><strong>Photosynthesis Reaction</strong></h2>
      <div className="molecule-container">
        <Molecule3D reaction="photosynthesis" isReacting={isSimulating} onAtomClick={onAtomClick} />
      </div>
      <div className="reaction-equation">
        <span className="reactant">6CO₂</span> +
        <span className="reactant">6H₂O</span> +
        <span className="energy">Light Energy</span> →
        <span className="product">C₆H₁₂O₆</span> +
        <span className="product">6O₂</span>
      </div>
      <div className="simple-info">
        <p><strong>What happens:</strong> Carbon dioxide and water, using light energy, are converted into glucose and oxygen.</p>
        <p><strong>Real use:</strong> Fundamental process for life on Earth, providing energy and oxygen.</p>
      </div>
    </div>
    <div className="note">
      <p><strong>Note:</strong> Photosynthesis primarily occurs in plants, algae, and certain bacteria, enabling them to produce their own food and release oxygen into the atmosphere.</p>
    </div>
  );
};

export default Photosynthesis3D;


