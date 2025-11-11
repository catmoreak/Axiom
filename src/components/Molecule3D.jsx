import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

const Atom = ({ position, color, size, speed, children, isReacting, charge, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      
      meshRef.current.rotation.x += speed * 0.02;
      meshRef.current.rotation.y += speed * 0.01;
      
      if (isReacting) {
        
        meshRef.current.scale.setScalar(
          1 + Math.sin(state.clock.elapsedTime * 10) * 0.3
        );
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.5;
      
        meshRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 15) * 0.5;
      } else {
        
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
        meshRef.current.material.emissiveIntensity = hovered ? 0.3 : 0;
      }
    }
  });

  return (
    <group>
      
      <mesh position={position} visible={hovered || !!charge || isReacting}>
        <sphereGeometry args={[size * (hovered ? 1.25 : 1.15), 32, 32]} />
        <meshBasicMaterial
          color={charge ? (charge > 0 ? '#ff6b6b' : '#4ecdc4') : color}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <Sphere
        ref={meshRef}
        position={position}
        args={[size, 64, 64]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          emissive={isReacting ? color : hovered ? color : '#000000'}
          emissiveIntensity={isReacting ? 0.9 : hovered ? 0.3 : 0}
          roughness={0.15}
          metalness={0.6}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          transmission={0.02}
          thickness={0.5}
        />
      </Sphere>

      
      {children && (
        <Html
          position={[position[0], position[1] + size + 0.2, position[2]]}
          center
          distanceFactor={6}
          occlude={[]}
        >
          <div className={`atom-label ${hovered ? 'atom-label-hover' : ''}`}>
            <span dangerouslySetInnerHTML={{ __html: String(children) }} />
            {charge ? <sup className="charge">{charge > 0 ? `+${charge}` : charge}</sup> : null}
          </div>
        </Html>
      )}
    </group>
  );
};


const Bond = ({ start, end, isReacting }) => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const midpoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];

  
  const angleX = Math.atan2(dy, dz);
  const angleY = Math.atan2(dx, dz);
  const angleZ = Math.atan2(dy, dx);

  return (
    <group position={midpoint} rotation={[angleX, angleY, angleZ]}>
      <Cylinder
        args={[0.05, 0.05, length, 8]} 
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={isReacting ? '#ff4500' : '#ffffff'}
          emissive={isReacting ? '#ff4500' : '#000000'}
          emissiveIntensity={isReacting ? 0.5 : 0}
          roughness={0.2}
          metalness={0.8}
        />
      </Cylinder>
    </group>
  );
};


const ParticleSystem = ({ count = 50, isActive, reactionType }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      let color = '#ffff00'; 
      if (reactionType === 'combustion') color = Math.random() > 0.5 ? '#ff4500' : '#ffa500'; 
      else if (reactionType === 'acidBase') color = Math.random() > 0.5 ? '#74b9ff' : '#ffffff'; 
      else if (reactionType === 'photosynthesis') color = Math.random() > 0.5 ? '#ffd93d' : '#00b894'; 
      
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ],
        velocity: [
          (Math.random() - 0.5) * 0.1,
          reactionType === 'combustion' ? Math.random() * 0.2 : (Math.random() - 0.5) * 0.1, 
          (Math.random() - 0.5) * 0.1
        ],
        life: Math.random(),
        color: color,
        size: reactionType === 'acidBase' ? 0.08 : 0.05 
      });
    }
    return temp;
  });

  useFrame(() => {
    if (particlesRef.current && isActive) {
      particles.forEach((particle, i) => {
        particle.position[0] += particle.velocity[0];
        particle.position[1] += particle.velocity[1];
        particle.position[2] += particle.velocity[2];
        particle.life -= 0.01;
        
        if (particle.life <= 0) {
          particle.position = [0, 0, 0];
          particle.life = 1;
        }
      });
    }
  });

  if (!isActive) return null;

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <Sphere key={i} position={particle.position} args={[particle.size, 8, 8]}>
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={particle.life}
          />
        </Sphere>
      ))}
    </group>
  );
};


const Molecule3D = ({ reaction, isReacting, selectedAcid, selectedBase, productType, onAtomClick }) => {
  const getMoleculeData = (reactionType) => {
    switch (reactionType) {
      case 'photosynthesis':
        return {
          atoms: [
            
            { pos: [-3, 1, 0], color: '#2d3436', size: 0.4, speed: 1, label: 'C' },
            { pos: [-3.5, 1, 0], color: '#e17055', size: 0.35, speed: 1, label: 'O' },
            { pos: [-2.5, 1, 0], color: '#e17055', size: 0.35, speed: 1, label: 'O' },
            
            { pos: [-1, 1, 0], color: '#ffffff', size: 0.3, speed: 1, label: 'H' },
            { pos: [-0.5, 1, 0], color: '#e17055', size: 0.35, speed: 1, label: 'O' },
            { pos: [0, 1, 0], color: '#ffffff', size: 0.3, speed: 1, label: 'H' },
            
            { pos: [2, 2, 0], color: '#ffd93d', size: 0.5, speed: 3, label: '☀️' },
          ],
          bonds: [
            { start: [-3, 1, 0], end: [-3.5, 1, 0] },
            { start: [-3, 1, 0], end: [-2.5, 1, 0] },
            { start: [-1, 1, 0], end: [-0.5, 1, 0] },
            { start: [-0.5, 1, 0], end: [0, 1, 0] },
          ],
          products: [
            { pos: [-1, -2, 0], color: '#2d3436', size: 0.4, speed: 2, label: 'C₆H₁₂O₆' },
            { pos: [1, -2, 0], color: '#e17055', size: 0.35, speed: 2, label: 'O₂' },
            { pos: [2, -2, 0], color: '#e17055', size: 0.35, speed: 2, label: 'O₂' },
          ]
        };
      
      case 'combustion':
        return {
          atoms: [
            { pos: [-2, 1, 0], color: '#2d3436', size: 0.4, speed: 1, label: 'C' },
            { pos: [-2, 0, 0], color: '#ffffff', size: 0.3, speed: 2, label: 'H' },
            { pos: [-1, 1, 0], color: '#ffffff', size: 0.3, speed: 2, label: 'H' },
            { pos: [-2, 2, 0], color: '#ffffff', size: 0.3, speed: 2, label: 'H' },
            { pos: [-3, 1, 0], color: '#ffffff', size: 0.3, speed: 2, label: 'H' },
            { pos: [2, 0, 0], color: '#e17055', size: 0.35, speed: 1, label: 'O' },
            { pos: [2.5, 0, 0], color: '#e17055', size: 0.35, speed: 1, label: 'O' },
          ],
          bonds: [
            { start: [-2, 1, 0], end: [-2, 0, 0] },
            { start: [-2, 1, 0], end: [-1, 1, 0] },
            { start: [-2, 1, 0], end: [-2, 2, 0] },
            { start: [-2, 1, 0], end: [-3, 1, 0] },
            { start: [2, 0, 0], end: [2.5, 0, 0] },
          ],
          products: [
          
            { pos: [0, -2, 0], color: '#2d3436', size: 0.4, speed: 3, label: 'C' },
            { pos: [-0.8, -2, 0], color: '#e17055', size: 0.35, speed: 3, label: 'O' },
            { pos: [0.8, -2, 0], color: '#e17055', size: 0.35, speed: 3, label: 'O' },
            { pos: [-1.5, -2, 0], color: '#74b9ff', size: 0.35, speed: 3, label: 'H₂O' },
            { pos: [1.5, -2, 0], color: '#74b9ff', size: 0.35, speed: 3, label: 'H₂O' },
          ],
          productBonds: [
            { start: [-0.8, -2, 0], end: [0, -2, 0] },
            { start: [0, -2, 0], end: [0.8, -2, 0] },
          ]
        };

      case 'acidBase':
        const acidColor = selectedAcid ? selectedAcid.color : '#e17055';
        const baseColor = selectedBase ? selectedBase.color : '#00b894';
        const saltLabel = selectedAcid && selectedBase ? `${selectedAcid.name.replace('H', selectedBase.name.split('O')[0])}` : 'Salt';
        return {
          atoms: [
            { pos: [-2, 1, 0], color: acidColor, size: 0.4, speed: 1, label: selectedAcid ? selectedAcid.formula : 'HCl' },
            { pos: [-2, 0, 0], color: '#ffffff', size: 0.3, speed: 2, label: 'H' },
            { pos: [2, 1, 0], color: baseColor, size: 0.4, speed: 1, label: selectedBase ? selectedBase.formula : 'NaOH' },
            { pos: [2, 0, 0], color: '#74b9ff', size: 0.35, speed: 2, label: 'OH' },
          ],
          bonds: [
            { start: [-2, 1, 0], end: [-2, 0, 0] },
            { start: [2, 1, 0], end: [2, 0, 0] },
          ],
          products: [
            { pos: [0, -2, 0], color: '#ffeaa7', size: 0.4, speed: 3, label: saltLabel },
            
            { pos: [-1, -2, 0], color: '#e17055', size: 0.35, speed: 3, label: 'O' },
            { pos: [-1.5, -2, 0], color: '#ffffff', size: 0.3, speed: 3, label: 'H' },
            { pos: [-0.5, -2, 0], color: '#ffffff', size: 0.3, speed: 3, label: 'H' },
            ...(productType === "gas" ? [{ pos: [1, -2, 0], color: '#ffffff', size: 0.25, speed: 4, label: 'Gas' }] : [])
          ],
          productBonds: [
            
            { start: [-1, -2, 0], end: [-1.5, -2, 0] },
            { start: [-1, -2, 0], end: [-0.5, -2, 0] }
          ]
        };

      default:
        return {
          atoms: [
            { pos: [-1, 0, 0], color: '#ff6b6b', size: 0.3, speed: 1, label: 'A' },
            { pos: [1, 0, 0], color: '#4ecdc4', size: 0.3, speed: 1, label: 'B' },
          ],
          bonds: [],
          products: [
            { pos: [0, -2, 0], color: '#ffeaa7', size: 0.4, speed: 2, label: 'AB' },
          ]
        };
    }
  };

  const moleculeData = getMoleculeData(reaction);

  return (
    <Canvas
      style={{ 
        height: '500px', 
        background: 'radial-gradient(circle at 30% 30%, rgba(139, 69, 219, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(16, 185, 129, 0.1) 100%), linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderRadius: '16px'
      }}
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ antialias: true, shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap } }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b45db" castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#3b82f6" castShadow />
      <pointLight position={[0, 10, -10]} intensity={0.8} color="#10b981" castShadow />
      <directionalLight position={[0, -10, 0]} intensity={0.5} color="#ffffff" castShadow />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1.0}
        color="#ffffff"
        castShadow
      />
      
      
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshPhysicalMaterial color="#1a1a1a" transparent opacity={0.3} />
      </mesh>
      
      {moleculeData.atoms.map((atom, i) => (
        <Atom
          key={i}
          position={atom.pos}
          color={atom.color}
          size={atom.size}
          speed={atom.speed}
          isReacting={isReacting}
          onClick={() => onAtomClick && onAtomClick(atom.label)}
        >
          {atom.label}
        </Atom>
      ))}

    
      {moleculeData.bonds.map((bond, i) => (
        <Bond
          key={i}
          start={bond.start}
          end={bond.end}
          isReacting={isReacting}
        />
      ))}

      
      {isReacting && moleculeData.productBonds && moleculeData.productBonds.map((bond, i) => (
        <Bond
          key={`product-bond-${i}`}
          start={bond.start}
          end={bond.end}
          isReacting={true}
        />
      ))}

      
      <ParticleSystem isActive={isReacting} reactionType={reaction} />
      

      {isReacting && (
        <pointLight
          position={[0, 0, 5]}
          intensity={2 + Math.sin(Date.now() * 0.01) * 1}
          color={reaction === 'combustion' ? '#ff4500' : reaction === 'acidBase' ? '#74b9ff' : '#ffd93d'}
        />
      )}
      
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        autoRotate={isReacting}
        autoRotateSpeed={isReacting ? 4 : 0}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
};

export default Molecule3D;