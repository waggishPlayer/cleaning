import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function MGCarModel(props: any) {
  const { scene } = useGLTF('/2018-bmw-m5/source/2018_bmw_m5.glb');
  // Set all mesh materials to white
  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat.color) mat.color.set('#888888');
            if (mat.map) mat.map = null;
          });
        } else {
          if (child.material.color) child.material.color.set('#888888');
          if (child.material.map) child.material.map = null;
        }
        // Optional: increase metalness/roughness for a glossy white look
        if (child.material.metalness !== undefined) child.material.metalness = 0.6;
        if (child.material.roughness !== undefined) child.material.roughness = 0.35;
      }
    });
  }, [scene]);
  return <primitive object={scene} {...props} />;
}

export default function MGCarViewer() {
  return (
    <div style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'flex-end' }}>
      <Canvas camera={{ position: [0, 75, 250], fov: 28 }} shadows>
        {/* Dramatic Spotlight Effect */}
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 10, 7]} intensity={0.3} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <spotLight
          position={[0, 8, 3]}
          target-position={[0, 0.5, 0]}
          angle={0.22}
          penumbra={0.7}
          intensity={3.5}
          castShadow
          shadow-bias={-0.0001}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 5, -10]} intensity={0.15} />
        {/* Shadow-catching ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[8, 8]} />
          <shadowMaterial opacity={0.38} />
        </mesh>
        <Suspense fallback={null}>
          <MGCarModel scale={500} position={[0, -25, 0]} />
        </Suspense>
        <OrbitControls enablePan={false} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}

// Required for Drei's useGLTF loader
useGLTF.preload('/2018-bmw-m5/source/2018_bmw_m5.glb'); 