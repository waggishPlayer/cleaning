import React, { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function StylizedCar() {
  // Car body
  return (
    <group position={[0, -0.5, 0]}>
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Roof */}
      <mesh castShadow receiveShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[1.2, 0.3, 1]} />
        <meshStandardMaterial color="#333" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.1, 0.18, 0.98]} />
        <meshStandardMaterial color="#00ddff" metalness={0.1} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.7, 0.1, 0.45]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.7, 0.1, 0.45]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.7, 0.1, -0.45]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.7, 0.1, -0.45]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights */}
      <mesh position={[1.01, 0.4, 0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#c1ff72" emissive="#c1ff72" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[1.01, 0.4, -0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#c1ff72" emissive="#c1ff72" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function DirtyOverlay({ opacity }: { opacity: number }) {
  // A semi-transparent brownish mesh over the car
  return (
    <mesh position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.2, 1.2]} />
      <meshStandardMaterial color="#6b4f27" transparent opacity={opacity} />
    </mesh>
  );
}

function ScrollControlledCar() {
  const [dirt, setDirt] = useState(1);
  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const max = window.innerHeight * 0.6;
      setDirt(Math.max(0, 1 - scrollY / max));
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <group>
      <StylizedCar />
      <DirtyOverlay opacity={dirt} />
    </group>
  );
}

const Car3D: React.FC = () => (
  <div style={{ width: '100%', height: '60vh', background: 'black', borderBottom: '2px solid #222' }}>
    <Canvas camera={{ position: [0, 1.2, 4], fov: 40 }} shadows>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <Environment preset="city" background={false} />
      <ScrollControlledCar />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
    </Canvas>
  </div>
);

export default Car3D; 