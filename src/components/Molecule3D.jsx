import React, { useRef, useEffect, useState, useMemo, memo, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cylinder, Html, Effects } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';


extend({ EffectComposer, Bloom, ChromaticAberration });

const Atom = memo(({ position, color, size, speed, children, isReacting, charge, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01;
      meshRef.current.rotation.y += speed * 0.005;
      
      if (isReacting) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.2);
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.3;
        meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 12) * 0.4;
      } else {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        meshRef.current.scale.setScalar(hovered ? 1.15 : 1);
        meshRef.current.material.emissiveIntensity = hovered ? 0.2 : 0;
      }
    }
  });

  return (
    <group>
      <mesh position={position} visible={hovered || !!charge || isReacting}>
        <sphereGeometry args={[size * (hovered ? 1.2 : 1.1), 16, 16]} />
        <meshBasicMaterial
          color={charge ? (charge > 0 ? '#ff6b6b' : '#4ecdc4') : color}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      <Sphere
        ref={meshRef}
        position={position}
        args={[size, 32, 32]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          emissive={isReacting ? color : hovered ? color : '#000000'}
          emissiveIntensity={isReacting ? 0.7 : hovered ? 0.2 : 0}
          roughness={0.2}
          metalness={0.5}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          transmission={0.05}
          thickness={0.3}
        />
      </Sphere>

      {children && (
        <Html
          position={[position[0], position[1] + size + 0.15, position[2]]}
          center
          distanceFactor={8}
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
});


const Bond = memo(({ start, end, isReacting }) => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const midpoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];

  const direction = useMemo(() => new THREE.Vector3(dx, dy, dz).normalize(), [dx, dy, dz]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction), [direction]);

  return (
    <group position={midpoint} quaternion={quaternion}>
      <Cylinder
        args={[0.03, 0.03, length, 6]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={isReacting ? '#ff4500' : '#cccccc'}
          emissive={isReacting ? '#ff4500' : '#000000'}
          emissiveIntensity={isReacting ? 0.3 : 0}
          roughness={0.3}
          metalness={0.7}
        />
      </Cylinder>
    </group>
  );
});


const ParticleSystem = memo(({ count = 30, isActive, reactionType }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      let color = '#22c55e'; 
      if (reactionType === 'combustion') color = Math.random() > 0.5 ? '#16a34a' : '#15803d'; 
      else if (reactionType === 'acidBase') color = Math.random() > 0.5 ? '#166534' : '#14532d'; 
      else if (reactionType === 'photosynthesis') color = Math.random() > 0.5 ? '#22c55e' : '#16a34a';      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ],
        velocity: [
          (Math.random() - 0.5) * 0.08,
          reactionType === 'combustion' ? Math.random() * 0.15 : (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08
        ],
        life: Math.random(),
        color: color,
        size: reactionType === 'acidBase' ? 0.06 : 0.04
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
        particle.life -= 0.008;

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
        <Sphere key={i} position={particle.position} args={[particle.size, 6, 6]}>
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={particle.life}
          />
        </Sphere>
      ))}
    </group>
  );
});


const getMoleculeData = (reactionType, selectedAcid, selectedBase, productType) => {
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

const Molecule3D = ({ reaction, selectedAcid, selectedBase, productType, isReacting, onAtomClick }) => {
  const moleculeData = useMemo(() => getMoleculeData(reaction, selectedAcid, selectedBase, productType), [reaction, selectedAcid, selectedBase, productType]);

  return (
    <Canvas
      style={{
        height: '500px',
        background: 'radial-gradient(circle at 30% 30%, rgba(22, 163, 74, 0.3) 0%, rgba(21, 128, 61, 0.2) 50%, rgba(20, 83, 45, 0.1) 100%), linear-gradient(135deg, #0a2e0a 0%, #1a4d1a 100%)',
        borderRadius: '16px'
      }}
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{
        antialias: true,
        shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
        powerPreference: "high-performance",
        alpha: false
      }}
      dpr={[1, 2]}
      frameloop="demand"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#22c55e" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#16a34a" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[0, 10, -10]} intensity={0.6} color="#15803d" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[0, -10, 0]} intensity={0.4} color="#166534" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <spotLight
          position={[0, 20, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          color="#22c55e"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
        {isReacting && moleculeData.products && moleculeData.products.map((atom, i) => (
          <Atom
            key={`product-${i}`}
            position={atom.position}
            element={atom.element}
            color={atom.color}
            isReacting={isReacting}
          />
        ))}
        {isReacting && moleculeData.productBonds && moleculeData.productBonds.map((bond, i) => (
          <Bond
            key={`product-bond-${i}`}
            start={bond.start}
            end={bond.end}
            color={bond.color}
            isReacting={isReacting}
          />
        ))}

        <ParticleSystem isActive={isReacting} reactionType={reaction} />

        {isReacting && (
          <pointLight
            position={[0, 0, 5]}
            intensity={1.5 + Math.sin(Date.now() * 0.01) * 0.8}
            color={reaction === 'combustion' ? '#22c55e' : reaction === 'acidBase' ? '#16a34a' : '#15803d'}
          />
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={isReacting}
          autoRotateSpeed={isReacting ? 3 : 0}
          enableDamping={true}
          dampingFactor={0.08}
          minDistance={5}
          maxDistance={20}
        />
      </Suspense>
    </Canvas>
  );
};

export default Molecule3D;