import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Atom = ({ position, color, size, speed, children, isReacting }) => {
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
      } else {
        
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
      }
    }
  });

  return (
    <group>
      <Sphere
        ref={meshRef}
        position={position}
        args={[size, 64, 64]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          emissive={isReacting ? color : hovered ? color : '#000000'}
          emissiveIntensity={isReacting ? 0.8 : hovered ? 0.3 : 0}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.1}
          thickness={0.5}
        />
      </Sphere>
      {children && (
        <Text
          position={[position[0], position[1] + size + 0.3, position[2]]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {children}
        </Text>
      )}
    </group>
  );
};


const Bond = ({ start, end, isReacting }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current && isReacting) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 20) * 0.5;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={isReacting ? '#ff4500' : '#ffffff'}
        linewidth={isReacting ? 8 : 3}
        transparent
        opacity={0.8}
      />
    </line>
  );
};


const ParticleSystem = ({ count = 50, isActive }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ],
        velocity: [
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ],
        life: Math.random()
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
        <Sphere key={i} position={particle.position} args={[0.05, 8, 8]}>
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={particle.life}
          />
        </Sphere>
      ))}
    </group>
  );
};


const Molecule3D = ({ reaction, isReacting }) => {
  const getMoleculeData = (reactionType) => {
    switch (reactionType) {
      case 'photosynthesis':
        return {
          atoms: [
            
            { pos: [-3, 1, 0], color: '#2d3436', size: 0.4, speed: 1, label: 'C' },
            { pos: [-3.5, 1, 0], color: '#e17055', size: 0.3, speed: 1, label: 'O' },
            { pos: [-2.5, 1, 0], color: '#e17055', size: 0.3, speed: 1, label: 'O' },
            
            { pos: [-1, 1, 0], color: '#74b9ff', size: 0.3, speed: 1, label: 'H' },
            { pos: [-0.5, 1, 0], color: '#0984e3', size: 0.4, speed: 1, label: 'O' },
            { pos: [0, 1, 0], color: '#74b9ff', size: 0.3, speed: 1, label: 'H' },
            
            { pos: [2, 2, 0], color: '#ffd93d', size: 0.5, speed: 3, label: '☀️' },
          ],
          bonds: [
            { start: [-3, 1, 0], end: [-3.5, 1, 0] },
            { start: [-3, 1, 0], end: [-2.5, 1, 0] },
            { start: [-1, 1, 0], end: [-0.5, 1, 0] },
            { start: [-0.5, 1, 0], end: [0, 1, 0] },
          ],
          products: [
            { pos: [-1, -2, 0], color: '#00b894', size: 0.5, speed: 2, label: 'C₆H₁₂O₆' },
            { pos: [1, -2, 0], color: '#74b9ff', size: 0.4, speed: 2, label: 'O₂' },
            { pos: [2, -2, 0], color: '#74b9ff', size: 0.4, speed: 2, label: 'O₂' },
          ]
        };
      
      case 'combustion':
        return {
          atoms: [
            { pos: [-2, 1, 0], color: '#2d3436', size: 0.4, speed: 1, label: 'C' },
            { pos: [-2, 0, 0], color: '#ddd', size: 0.2, speed: 2, label: 'H' },
            { pos: [-1, 1, 0], color: '#ddd', size: 0.2, speed: 2, label: 'H' },
            { pos: [-2, 2, 0], color: '#ddd', size: 0.2, speed: 2, label: 'H' },
            { pos: [-3, 1, 0], color: '#ddd', size: 0.2, speed: 2, label: 'H' },
            { pos: [2, 0, 0], color: '#e17055', size: 0.3, speed: 1, label: 'O' },
            { pos: [2.5, 0, 0], color: '#e17055', size: 0.3, speed: 1, label: 'O' },
          ],
          bonds: [
            { start: [-2, 1, 0], end: [-2, 0, 0] },
            { start: [-2, 1, 0], end: [-1, 1, 0] },
            { start: [-2, 1, 0], end: [-2, 2, 0] },
            { start: [-2, 1, 0], end: [-3, 1, 0] },
            { start: [2, 0, 0], end: [2.5, 0, 0] },
          ],
          products: [
            { pos: [0, -2, 0], color: '#fd79a8', size: 0.4, speed: 3, label: 'CO₂' },
            { pos: [-1, -2, 0], color: '#74b9ff', size: 0.3, speed: 3, label: 'H₂O' },
            { pos: [1, -2, 0], color: '#74b9ff', size: 0.3, speed: 3, label: 'H₂O' },
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
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#8b45db" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[0, 10, -10]} intensity={0.6} color="#10b981" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />
      
      {/* Reactant atoms */}
      {moleculeData.atoms.map((atom, i) => (
        <Atom
          key={i}
          position={atom.pos}
          color={atom.color}
          size={atom.size}
          speed={atom.speed}
          isReacting={isReacting}
        >
          {atom.label}
        </Atom>
      ))}

      {/* Bonds */}
      {moleculeData.bonds.map((bond, i) => (
        <Bond
          key={i}
          start={bond.start}
          end={bond.end}
          isReacting={isReacting}
        />
      ))}

      {/* Product atoms (appear during reaction) */}
      {isReacting && moleculeData.products.map((product, i) => (
        <Atom
          key={`product-${i}`}
          position={product.pos}
          color={product.color}
          size={product.size}
          speed={product.speed}
          isReacting={true}
        >
          {product.label}
        </Atom>
      ))}

      {/* Particle effects */}
      <ParticleSystem isActive={isReacting} />
      
      {/* Interactive controls */}
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