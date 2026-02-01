import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Environment, Text, Grid, OrbitControls } from '@react-three/drei';
import { TARGET_COORDINATES, SPHERE_CONFIG } from '../constants';
import { calculateOffset } from '../utils/geoUtils';
import * as THREE from 'three';

// Initialize XR store for v6
const store = createXRStore();

interface XRExperienceProps {
  userLocation: GeolocationCoordinates | null;
  ready: boolean;
}

const TargetSphere: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* The main sphere */}
      <mesh>
        <sphereGeometry args={[SPHERE_CONFIG.radius, 64, 64]} />
        <meshStandardMaterial 
          color={SPHERE_CONFIG.color} 
          roughness={0.2} 
          metalness={0.8}
          emissive={SPHERE_CONFIG.color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* A label floating above it */}
      <Text
        position={[0, SPHERE_CONFIG.radius + 1.5, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        Target
      </Text>
      
      {/* A vertical line to the ground to help visualize position */}
      <mesh position={[0, -position[1] / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, position[1], 8]} />
        <meshBasicMaterial color="white" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

export const XRExperience: React.FC<XRExperienceProps> = ({ userLocation, ready }) => {
  
  const targetPosition = useMemo(() => {
    if (!userLocation) return null;

    // Calculate relative position in meters
    const offset = calculateOffset(
      userLocation.latitude,
      userLocation.longitude,
      TARGET_COORDINATES.latitude,
      TARGET_COORDINATES.longitude
    );

    // Apply the configured altitude (5m above ground)
    return new THREE.Vector3(offset.x, SPHERE_CONFIG.altitude, offset.z);
  }, [userLocation]);

  const handleEnterAR = () => {
    if (ready) {
      store.enterAR();
    }
  };

  return (
    <>
      {/* Custom AR Button replacing removed XRButton component */}
      <button 
        onClick={handleEnterAR}
        disabled={!ready}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-3 font-bold rounded-full shadow-xl transition-transform ${
          ready 
            ? 'bg-white text-black hover:scale-105 cursor-pointer' 
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
        }`}
      >
        {ready ? 'Enter AR' : 'Waiting for GPS...'}
      </button>

      <Canvas>
        <XR store={store}>
          {/* In v6, default controllers/hands are managed by the store/XR component logic or can be customized via store options, 
              but explicit <Controllers/> and <Hands/> components are removed. */}
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="sunset" />

          {/* 
            If ready and we have a position, place the object.
          */}
          {ready && targetPosition && (
            <TargetSphere position={[targetPosition.x, targetPosition.y, targetPosition.z]} />
          )}

          {/* Helper grid for non-AR debugging or floor reference */}
          <Grid infiniteGrid sectionColor="white" cellColor="#555" fadeDistance={50} />
          
          {/* Debug controls for browser view */}
          <OrbitControls makeDefault />
        </XR>
      </Canvas>
    </>
  );
};